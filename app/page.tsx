'use client';

import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import {
  collection,
  documentId,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db, rtdb } from '@/lib/firebase';
import { trimWrappingQuotes } from '@/utils/text';
import { InstallButton } from '@/components/install-button';
import { CountdownTimer } from '@/components/countdown-timer';
import { PreviewCard } from '@/components/preview-card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Home() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [targetEpoch, setTargetEpoch] = useState<number | null>(null);
  const [enabledIds, setEnabledIds] = useState<string[]>([]);
  const [activities, setActivities] = useState<Array<{ id: string; [k: string]: any }>>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      console.log('Install prompt ready');
    };

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('App is running as standalone');
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('App installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setInstallPrompt(null);
  };

  useEffect(() => {
    const resetRef = ref(rtdb, 'reset-day');
    const unsubscribe = onValue(
      resetRef,
      (snapshot) => {
        const value = snapshot.val();
        if (typeof value === 'number') {
          setTargetEpoch(value);
        } else if (typeof value === 'string') {
          const parsed = Number(value);
          if (!Number.isNaN(parsed)) setTargetEpoch(parsed);
        }
      },
      (error) => {
        console.error('Failed to read reset-day from RTDB', error);
      },
    );

    return () => unsubscribe();
  }, []);

  // Listen to the list of enabled activities from RTDB
  useEffect(() => {
    const enabledRef = ref(rtdb, 'currently-enabled-activities');
    const unsub = onValue(
      enabledRef,
      (snap) => {
        const raw = snap.val();
        let ids: string[] = [];
        if (Array.isArray(raw)) {
          ids = raw.filter((v) => typeof v === 'string' && v.length > 0);
        } else if (raw && typeof raw === 'object') {
          ids = Object.keys(raw).filter((k) => !!raw[k]);
        }
        setEnabledIds(ids);
      },
      (err) => {
        console.error('Failed to read currently-enabled-activities', err);
        setError('Impossibile caricare la lista attività abilitate');
      },
    );
    return () => unsub();
  }, []);

  // Fetch enabled activities from Firestore whenever the enabled IDs change
  useEffect(() => {
    let alive = true;
    const fetchAll = async () => {
      if (!enabledIds || enabledIds.length === 0) {
        setActivities([]);
        setCategoryNames({});
        return;
      }
      setLoadingActivities(true);
      setError(null);

      const chunk = <T,>(arr: T[], size: number) => {
        const out: T[][] = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
      };

      try {
        // 1) Fetch activities by IDs (in batches of 10 due to Firestore limits)
        const activityChunks = chunk(enabledIds, 10);
        const activityDocs: Array<{ id: string; [k: string]: any }> = [];
        for (const ids of activityChunks) {
          const q = query(collection(db, 'Activity'), where(documentId(), 'in', ids));
          const snap = await getDocs(q);
          snap.forEach((d) => activityDocs.push({ id: d.id, ...d.data() }));
        }

        if (!alive) return;
        setActivities(activityDocs);

        // 2) Derive category IDs from activities
        const catIdSet = new Set<string>();
        for (const a of activityDocs) {
          const catRef = a.Category ?? a.category;
          let catId: string | undefined;
          
          // Handle DocumentReference objects
          if (catRef && typeof catRef === 'object' && 'id' in catRef) {
            catId = (catRef as any).id;
          } else if (typeof catRef === 'string' && catRef.length > 0) {
            // Handle string paths (fallback)
            const parts = catRef.split('/').filter(Boolean);
            catId = parts.length > 1 ? parts[parts.length - 1] : catRef;
          }
          
          if (catId) {
            (a as any).__catId = catId;
            catIdSet.add(catId);
          }
        }
        const catIds = Array.from(catIdSet);

        if (catIds.length === 0) {
          setCategoryNames({});
          return;
        }

        // 3) Fetch categories to get their names
        const categoryChunks = chunk(catIds, 10);
        const nameMap: Record<string, string> = {};
        for (const ids of categoryChunks) {
          const q = query(collection(db, 'Categories'), where(documentId(), 'in', ids));
          const snap = await getDocs(q);
          snap.forEach((d) => {
            const data = d.data() as any;
            const candidate = data?.Name;
            let nameStr: string = d.id;
            if (typeof candidate === 'string') {
              nameStr = candidate;
            } else if (candidate && typeof candidate === 'object') {
              const inner = Object.values(candidate).find((v) => typeof v === 'string');
              if (typeof inner === 'string') nameStr = inner;
            }
            nameMap[d.id] = trimWrappingQuotes(nameStr);
          });
        }

        if (!alive) return;
        setCategoryNames(nameMap);
      } catch (e: any) {
        console.error('Fetching activities/categories failed', e);
        if (!alive) return;
        setError('Errore nel caricamento delle attività');
      } finally {
        if (alive) setLoadingActivities(false);
      }
    };

    fetchAll();
    return () => {
      alive = false;
    };
  }, [enabledIds]);

  const activitiesByCategory = useMemo(() => {
    const grouped: Record<string, Array<{ id: string; [k: string]: any }>> = {};
    for (const a of activities) {
      const raw = (a as any).__catId ?? (a.Category ?? a.category ?? 'uncategorized');
      const parts = typeof raw === 'string' ? raw.split('/').filter(Boolean) : [];
      const catId = parts.length > 1 ? parts[parts.length - 1] : (raw as string);
      if (!grouped[catId]) grouped[catId] = [];
      grouped[catId].push(a);
    }
    return grouped;
  }, [activities]);

  return (
    <div className="flex h-full bg-white font-sans">
      <main className="flex flex-col h-full w-full pl-6 pr-0">
        {targetEpoch ? (
          <CountdownTimer targetUnixEpoch={targetEpoch} className='mx-7 mr-13'/>
        ) : (
          <div className="mx-7 rounded-3xl bg-zinc-200 px-4 py-3 text-center text-sm font-medium text-zinc-700 mr-13">
            Caricamento timer...
          </div>
        )}
        <section className="mt-8 flex-1 overflow-y-auto" id="activities">
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {!loadingActivities && !error && Object.keys(activitiesByCategory).length === 0 && (
            <div className="text-sm text-zinc-600">Nessuna attività abilitata.</div>
          )}

          {Object.entries(activitiesByCategory).map(([catId, items]) => (
            <div key={catId} className="mb-8">
              <h2 className="mb-3 text-lg font-semibold text-zinc-900">
                {loadingActivities ? (
                  <div className="h-7 w-32 bg-zinc-200 rounded animate-pulse"></div>
                ) : (
                  categoryNames[catId] ?? catId
                )}
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none]">
                {items.map((a) => {
                  const title = trimWrappingQuotes((a.title ?? a.Title ?? a.name ?? 'Senza titolo') as string);
                  const imageUrl = trimWrappingQuotes((
                    a.imageUrl ?? a.ImageUrl ?? a.Imgsrc ?? a.ImgSrc ?? a.image ?? a.imgSrc ?? undefined
                  ) as string | undefined);
                  return (
                    <div key={a.id} className="min-w-[280px] max-w-[280px] shrink-0">
                      <PreviewCard
                        title={title}
                        imageUrl={imageUrl}
                        linkUrl={`/activity/${a.id}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </main>
      { installPrompt && !isInstalled && (
        <InstallButton
          onClick={handleInstall}
          className="fixed bottom-18 left-0 right-0 shadow-lg"
        >
        </InstallButton>
      )}
    </div>
  );
}
