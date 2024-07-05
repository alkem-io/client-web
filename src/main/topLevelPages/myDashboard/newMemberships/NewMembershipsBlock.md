# NewMembershipsBlock Documentation

## Overview

A widget on My Dashboard

## Function

It shows the Pending Invites and Applications. User can Accept / Reject an invite through it.

### Details

The logic of the block is as follows:

1. Show up to 4 (PENDING_MEMBERSHIPS_MAX_ITEMS) **Invitations**;
2. Then show up to 4 (minus the length of the invitations) **Applications**;
3. If there are more than PENDING_MEMBERSHIPS_MAX_ITEMS items, show a 'seeMore' button.

'seeMore' opens all Pending Invitations Dialog.

The user can accept/reject the individual invitations.

#### History

The block used to list recentMemberships & MySpaces.
