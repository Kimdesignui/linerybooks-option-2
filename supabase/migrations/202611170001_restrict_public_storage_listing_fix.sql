-- Apply the policy-name correction for environments where the original
-- storage migration created the hosted policy aliases.
drop policy if exists "public reads site media files" on storage.objects;
drop policy if exists "demo uploads site media files" on storage.objects;
