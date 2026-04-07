import { useCallback, useEffect, useMemo, useRef } from 'react';
import { serializeJson } from './utils';
import type { AdminLessonSection } from '../../../types/admin';
import type { SectionDraftState } from './state';

interface UseSectionDraftSyncParams {
  selectedSection: AdminLessonSection | null;
  sectionDraft: SectionDraftState | null;
  setSectionDraft: React.Dispatch<React.SetStateAction<SectionDraftState | null>>;
}

export function useSectionDraftSync({
  selectedSection,
  sectionDraft,
  setSectionDraft,
}: UseSectionDraftSyncParams) {
  const lastSyncedSectionIdRef = useRef<string | null>(null);
  const lastSyncedSectionFingerprintRef = useRef<string | null>(null);

  const selectedSectionFingerprint = useMemo(() => {
    if (!selectedSection) return null;

    return JSON.stringify({
      id: selectedSection.id,
      title: selectedSection.title,
      type: selectedSection.type,
      contentJson: serializeJson(selectedSection.content).trim(),
    });
  }, [selectedSection]);

  const syncSectionDraft = useCallback((section: AdminLessonSection | null) => {
    if (!section) {
      setSectionDraft(null);
      lastSyncedSectionIdRef.current = null;
      lastSyncedSectionFingerprintRef.current = null;
      return;
    }

    const fingerprint = JSON.stringify({
      id: section.id,
      title: section.title,
      type: section.type,
      contentJson: serializeJson(section.content).trim(),
    });

    setSectionDraft({
      title: section.title,
      type: section.type,
      contentJson: serializeJson(section.content),
    });
    lastSyncedSectionIdRef.current = section.id;
    lastSyncedSectionFingerprintRef.current = fingerprint;
  }, [setSectionDraft]);

  useEffect(() => {
    if (!selectedSection || !selectedSectionFingerprint) {
      syncSectionDraft(null);
      return;
    }

    const currentDraftFingerprint = sectionDraft
      ? JSON.stringify({
          id: selectedSection.id,
          title: sectionDraft.title,
          type: sectionDraft.type,
          contentJson: sectionDraft.contentJson.trim(),
        })
      : null;

    const selectionChanged = lastSyncedSectionIdRef.current !== selectedSection.id;
    const sourceChangedSinceLastSync = lastSyncedSectionFingerprintRef.current !== selectedSectionFingerprint;
    const draftStillMatchesLastSynced =
      currentDraftFingerprint === null
      || currentDraftFingerprint === selectedSectionFingerprint
      || currentDraftFingerprint === lastSyncedSectionFingerprintRef.current;

    if (selectionChanged || (sourceChangedSinceLastSync && draftStillMatchesLastSynced)) {
      syncSectionDraft(selectedSection);
      return;
    }

    if (currentDraftFingerprint === selectedSectionFingerprint) {
      lastSyncedSectionIdRef.current = selectedSection.id;
      lastSyncedSectionFingerprintRef.current = selectedSectionFingerprint;
    }
  }, [sectionDraft, selectedSection, selectedSectionFingerprint, syncSectionDraft]);
}
