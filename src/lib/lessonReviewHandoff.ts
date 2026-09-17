import type { LearningItem, UUID } from '../domain/learning';
import { useLearningItemStore } from '../stores/useLearningItemStore';

export function handoffLessonItemsToReview(
  lessonId: UUID,
  items: LearningItem[],
  now = new Date(),
): UUID[] {
  const reviewableItems = items.filter((item) => item.reviewable);
  const store = useLearningItemStore.getState();
  store.upsertItems(items);
  store.enqueueForReview(reviewableItems.map((item) => item.id), lessonId, now);
  return reviewableItems.map((item) => item.id);
}
