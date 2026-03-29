# Video Link Organizer

## Current State
Simple Calendar app exists. No video link management features.

## Requested Changes (Diff)

### Add
- Video link organizer page as the main app
- Save YouTube/video URLs with a title and optional tag/category
- Display saved links in a grid/list with title, tag, and a thumbnail (via YouTube embed URL)
- Delete saved links
- Filter links by tag

### Modify
- Replace calendar as the main view with the video link organizer

### Remove
- Calendar component (replaced)

## Implementation Plan
1. Backend: store video entries (id, title, url, tag, createdAt) in stable memory
2. Backend: CRUD operations - addVideo, getVideos, deleteVideo
3. Frontend: input form (URL, title, tag), video card grid, tag filter bar, delete button per card
