import { AdminBuilderNav } from '../admin/builder/AdminBuilderNav';
import { AdminSectionsPane } from '../admin/builder/AdminSectionsPane';
import { LessonMetaPanel } from '../admin/builder/LessonMetaPanel';
import { SectionWorkspace } from '../admin/builder/SectionWorkspace';
import { useAdminLessonBuilder } from '../admin/builder/useAdminLessonBuilder';
import { SettingsGearIcon } from '../../icons';
import { useAuthStore } from '../../stores/useAuthStore';

export function AdminLessonBuilderView() {
  const profile = useAuthStore((state) => state.profile);
  const logout = useAuthStore((state) => state.logout);
  const canManageLessons = profile?.role === 'teacher' || profile?.role === 'admin';

  const {
    selectedLesson,
    selectedSectionId,
    setSelectedSectionId,
    metaDraft,
    setMetaDraft,
    loading,
    saving,
    hasUnsavedChanges,
    isNavCollapsed,
    setIsNavCollapsed,
    isMetaCollapsed,
    setIsMetaCollapsed,
    dragSectionId,
    setDragSectionId,
    dragOverSectionId,
    setDragOverSectionId,
    error,
    publishValidationErrors,
    highlightedBlockId,
    sectionDraft,
    orderedSections,
    selectedSection,
    orderedBlocks,
    displayedLessonTitle,
    markDirty,
    handleSaveLessonMeta,
    handleCreateSection,
    handleUpdateSectionDraft,
    handleDeleteSection,
    handleDropSection,
    handleCreateBlock,
    handleInsertBlockAfter,
    handleSaveBlock,
    handleDeleteBlock,
    handleReorderBlock,
  } = useAdminLessonBuilder(canManageLessons);

  if (!canManageLessons) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="placeholder-card max-w-md w-full">
          <div className="placeholder-card__emoji">🔒</div>
          <div className="placeholder-card__title">Нужен доступ преподавателя или администратора</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="ab-loading">
        <div className="ab-spinner" />
      </div>
    );
  }

  const firstName = profile?.fullName?.split(' ')[0] ?? 'П';
  const roleLabel = profile?.role === 'admin' ? 'Администратор' : 'Преподаватель';
  const selectedSectionOrder = selectedSection
    ? orderedSections.findIndex((section) => section.id === selectedSection.id) + 1
    : 1;
  const handleOpenPreview = () => {
    if (typeof window === 'undefined') return;
    const previewUrl = new URL('/lesson', window.location.origin);
    if (selectedSectionOrder > 0) {
      previewUrl.searchParams.set('section', String(selectedSectionOrder));
    }
    window.open(previewUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`admin-builder${isNavCollapsed ? ' admin-builder--nav-collapsed' : ''}`}>
      <AdminBuilderNav
        isCollapsed={isNavCollapsed}
        firstName={firstName}
        fullName={profile?.fullName ?? 'User'}
        roleLabel={roleLabel}
        disabled={saving || !selectedLesson}
        onToggleCollapsed={() => setIsNavCollapsed((current) => !current)}
        onPublish={() => void handleSaveLessonMeta('published')}
        onLogout={logout}
      />

      <AdminSectionsPane
        displayedLessonTitle={displayedLessonTitle}
        sections={orderedSections}
        selectedSectionId={selectedSectionId}
        hasUnsavedChanges={hasUnsavedChanges}
        saving={saving || !selectedLesson}
        dragSectionId={dragSectionId}
        dragOverSectionId={dragOverSectionId}
        setDragSectionId={setDragSectionId}
        setDragOverSectionId={setDragOverSectionId}
        onSelectSection={setSelectedSectionId}
        onAddSection={() => void handleCreateSection()}
        onDeleteSection={(sectionId) => void handleDeleteSection(sectionId)}
        onDropSection={(dragId, overId) => void handleDropSection(dragId, overId)}
      />

      <main className="admin-builder__workspace">
        <header className="admin-builder__topbar">
          <div className="admin-builder__topbar-left">
            <div className="admin-builder__topbar-title">Конструктор урока</div>
          </div>
          <div className="admin-builder__topbar-right">
            {error && <span className="admin-builder__topbar-error">{error}</span>}
            <button
              className="ab-btn ab-btn--ghost"
              type="button"
              onClick={handleOpenPreview}
              disabled={!selectedLesson}
            >
              Предпросмотр
            </button>
            <button
              className="ab-btn ab-btn--primary"
              type="button"
              onClick={() => void handleSaveLessonMeta()}
              disabled={saving || !selectedLesson || !hasUnsavedChanges}
            >
              {saving ? 'Сохранение…' : 'Сохранить изменения'}
            </button>
          </div>
        </header>

        {publishValidationErrors.length > 0 && (
          <div className="admin-builder__validation-panel" role="alert" aria-live="polite">
            <div className="admin-builder__validation-panel-header">
              <div className="admin-builder__validation-panel-title">Перед публикацией нужно исправить:</div>
              <div className="admin-builder__validation-panel-subtitle">
                Заполни обязательные поля и попробуй опубликовать снова.
              </div>
            </div>
            <ul className="admin-builder__validation-list">
              {publishValidationErrors.map((validationError, index) => (
                <li key={`${validationError}-${index}`} className="admin-builder__validation-item">
                  {validationError}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="admin-builder__workspace-scroll">
          {!selectedLesson ? (
            <div className="admin-builder__workspace-empty">
              <SettingsGearIcon size={24} />
              <div>Не удалось загрузить урок.</div>
            </div>
          ) : (
            <>
              <LessonMetaPanel
                metaDraft={metaDraft}
                isCollapsed={isMetaCollapsed}
                saving={saving}
                onToggleCollapsed={() => setIsMetaCollapsed((current) => !current)}
                onTitleChange={(title) => {
                  setMetaDraft((previous) => ({ ...previous, title }));
                  markDirty();
                }}
                onDescriptionChange={(description) => {
                  setMetaDraft((previous) => ({ ...previous, description }));
                  markDirty();
                }}
                onStatusChange={(status) => {
                  setMetaDraft((previous) => ({ ...previous, status }));
                  markDirty();
                }}
              />

              <div className="admin-builder__workspace-divider" aria-hidden="true" />

              <SectionWorkspace
                selectedSection={selectedSection}
                sectionDraft={sectionDraft}
                orderedBlocks={orderedBlocks}
                highlightedBlockId={highlightedBlockId}
                saving={saving}
                onSectionDraftChange={handleUpdateSectionDraft}
                onCreateBlock={handleCreateBlock}
                onReorderBlock={handleReorderBlock}
                onInsertBelow={handleInsertBlockAfter}
                onSaveBlock={handleSaveBlock}
                onDeleteBlock={handleDeleteBlock}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
