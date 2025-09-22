from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Review
from sentiment_analysis.services import SentimentAnalysisService, BilingualSentimentService
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Review)
def analyze_review_sentiment_signal(sender, instance: Review, created, **kwargs):
    """Automatically analyze sentiment when a new review is created.

    Use the bilingual service which will detect language (vi vs en) and choose
    the correct Naive Bayes model. This avoids forcing the English model on
    Vietnamese reviews like 'sản phẩm tốt'.
    """
    if created and not instance.sentiment:
        try:
            # Use bilingual service so language is autodetected
            service = BilingualSentimentService()
            combined = f"{instance.title or ''} {instance.comment or ''}".strip()
            result = service.predict(combined)

            instance.sentiment = result.get('sentiment')
            instance.sentiment_confidence = result.get('confidence')
            instance.sentiment_scores = result.get('probabilities')
            instance.save(update_fields=['sentiment','sentiment_confidence','sentiment_scores','sentiment_analyzed_at','updated_at'])
            logger.info(f"Sentiment analyzed for review {instance.id}: {instance.sentiment}")
        except Exception as e:
            logger.error(f"Sentiment analysis failed for review {instance.id}: {e}")
