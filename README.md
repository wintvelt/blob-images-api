# Backend Repo for Photo storage service

### API Users
Path            | Method  | Body                | Function
----------------|---------|---------------------|------------------------------------------------------
`/users`        | `GET`   |                     | Gets user details for currently authenticated user *NB: also updates user record with latest visit date*
`/users`        | `PUT`   | `{ name, photoId }` | Updates user attributes for any provided details, will also include `photo` for `photoId`
`/users`        | `DELETE`|                     | Deletes current user (and all data)

#### User creation
A separate function `createUser` is called from AWS Cognito Post Confirmation trigger.
Checks if user exists (in case confirmation is resent)

Creation of user is without profile picture. When uploading a photo, you can provide metadata to set it as the profile picture of the active user. [see here](####metadata-with-file-uploadsn)

### API Invites
Path                 | Method   | Body                                   | Function
---------------------|----------|----------------------------------------|------------------------------------------------------
`/groups/[id]/invite`| `POST`   | `{ toName, toEmail, message, role }`   | Creates an invite to a group, for user or email. Only if email is not yet invited or member. Also sends an email to invite
`/invites/[id]`      | `GET`    | `{ toName, toEmail, message, role }`    | Retrieves an invite.  
`/invites/[id]`      | `POST`   |                                         | Accept invite. Changes membership status from invite to active. Also sends emails to user who invited.
`/invites/[id]`      | `DELETE` |                                         | Decline invite. Deletes member record and sends email to user who invited.


### API Groups
Path            | Method  | Body                                   | Function
----------------|---------|----------------------------------------|------------------------------------------------------
`/groups`       | `POST`  | `{ name, description, photoId }`       | Creates new group, will also include `photo` based on `photoId` 
`/groups/[id]`  | `GET`   |                                        | Retrieves group (user membership) including role (admin/ guest). User must be member of group
`/groups`       | `GET`   |                                        | Lists all group memberships of this user
`/groups/[id]/members`  | `GET`   |                                | Retrieves all members of this group. User must be member/ invite
`/groups/[id]`  | `PUT`   | `{ name, description, photoId }`       | Updates group, will also include `photo` based on `photoId`. User must be group admin
`/groups/[id]/membership/[id]`  | `PUT`   | `{ newRole }`    | Updates member role. User must be group admin
`/groups/[id]`  | `DELETE`|                                        | Deletes group. User must be group admin
`/groups/[id]/membership/[id]`  | `DELETE`   |               | Deletes member from group. User must be group admin

### API Albums
Path                          | Method  | Body                      | Function
------------------------------|---------|---------------------------|------------------------------------------------------
`/groups[id]/albums`          | `POST`  | `{ name, photoId }`       | Creates new album, will also include `photo` based on `photoId`
`/groups[id]/albums`          | `GET`   |                           | Lists all albums in this group
`/groups[id]/albums/[id]`| `GET`   |                           | Retrieves album info
`/groups[id]/albums/[id]`| `PUT`   | `{ name, photoId }`       | Updates album info
`/groups[id]/albums/[id]/photos`| `GET`   |                    | Lists all photos in this album
`/groups[id]/albums/[id]/photos`| `POST`  | `{ photoId }`      | Adds a photo to this album
`/groups[id]/albums/[id]/photos/[id]`| `DELETE`  |        | Removes a photo from this album

### API Photos
Path                          | Method  | Body     | Function
------------------------------|---------|----------|------------------------------------------------------
`/photos`                     | `GET`   |          | Lists all photos of this user
`/photos/[id]`                | `GET`   |          | Retrieves individual photo
`/photos/[id]/publications`   | `GET`   |          | Lists all publications of photo (in albums)
`/photos/[id]`                | `DELETE`|          | Deletes a photo

#### Metadata with file uploads
Function `createPhoto` is called from S3 bucket, and has no public API.
- creates a new photo entity in the database.
- S3 file metadata is needed. May contain
  - `{ userId }`: photo only added to private photos
  - `{ userId, action: 'add', groupid, albumid }`: photo is also added to the album
  - `{ userId, action: 'groupcover', groupid }`: photo is set as group cover photo
  - `{ userId, action: 'albumcover', groupid, albumid }`: photo is set as group cover photo
  - `{ userId, action: 'usercover' }`: photo is set as avatar for user

### API Ratings
Path                          | Method  | Body                      | Function
------------------------------|---------|---------------------------|------------------------------------------------------
`photos/{id}/rating`          | `GET`   |                           | Retrieves rating by current user of a photo
`photos/{id}/rating`          | `POST`  | `{ ratingUpdate }`        | Updates user rating of photo with +1 or -1





TODO:
- [x] Change getUser - should be based on cognito id, not path
- [ ] Implement user Delete
- [ ] implement group delete
- [ ] implement membership delete


