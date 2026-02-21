import logging

from supabase import create_client

from app.config import settings

logger = logging.getLogger("qwizme.storage")

BUCKET_NAME = "quiz-images"
PROFILE_BUCKET = "profile-pictures"


def upload_to_supabase(filename: str, data: bytes, content_type: str) -> str:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    client.storage.from_(BUCKET_NAME).upload(
        filename,
        data,
        file_options={"content-type": content_type},
    )
    return client.storage.from_(BUCKET_NAME).get_public_url(filename)


def upload_profile_picture(filename: str, data: bytes, content_type: str) -> str:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    client.storage.from_(PROFILE_BUCKET).upload(
        filename,
        data,
        file_options={"content-type": content_type},
    )
    return client.storage.from_(PROFILE_BUCKET).get_public_url(filename)


def delete_from_supabase(filename: str, bucket: str = BUCKET_NAME) -> None:
    try:
        client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        client.storage.from_(bucket).remove([filename])
    except Exception as e:
        logger.warning("Failed to delete %s from %s: %s", filename, bucket, e)
