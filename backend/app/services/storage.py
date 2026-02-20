from supabase import create_client

from app.config import settings

BUCKET_NAME = "quiz-images"


def upload_to_supabase(filename: str, data: bytes, content_type: str) -> str:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    client.storage.from_(BUCKET_NAME).upload(
        filename,
        data,
        file_options={"content-type": content_type},
    )
    return client.storage.from_(BUCKET_NAME).get_public_url(filename)
