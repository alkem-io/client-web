# Feature Specification: Add to Calendar

**Feature Branch**: `4-add-to-calendar`
**Created**: 2025-02-18
**Status**: Draft
**Input**: User description: "This product is a digital collaboration platform where there is a calendar with events. The issue for users is that when an admin adds an event to the calendar, afterwards they also create a teams / outlook / google event. The need is thus to easily add events from the platform to your personal/work calendar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Export Single Event to Personal Calendar (Priority: P1)

As a **platform user**, I want to export a calendar event from the platform to my personal calendar application (Teams, Outlook, Google Calendar), so that I can manage all my events in one place without manually recreating them.

**Acceptance Scenarios**:

1. **Given** I am viewing a calendar event on the platform, **When** I click the "Add to Calendar" button, **Then** I see options to export to different calendar formats (Google Calendar, Outlook, Apple Calendar, etc.)
2. **Given** I select "Google Calendar" from the export options, **When** the export triggers, **Then** I am redirected to Google Calendar with the event pre-filled (title, date, time, location, description)
3. **Given** I select "Outlook" or "Apple Calendar" from the export options, **When** the export triggers, **Then** an .ics file is downloaded to my device
4. **Given** I open the downloaded .ics file, **When** I import it into my calendar application, **Then** the event appears with all details correctly formatted (title, start/end dates, timezone, location, description)
5. **Given** the event has a description, **When** I export it, **Then** the description includes a link back to the platform event page

---

### User Story 2 - Export Event from Calendar List View (Priority: P2)

As a **platform user**, I want to export multiple events at once from the platform to my personal calendar.

**Acceptance Scenarios**:

1.

---

### User Story 3 - Export Event from Email Notification (Priority: P2)

As a **platform user**, I want to add an event to my personal calendar directly from the email notification I receive, so that I can quickly add events without having to go to the events page.

**Acceptance Scenarios**:

1. **Given** I receive an email notification about a new calendar event, **When** I view the email, **Then** I see an "Add to Calendar" button or link
2. **Given** I click the "Add to Calendar" link in the email, **When** the action triggers, **Then** I see options to export to different calendar formats (Google Calendar, Outlook, Apple Calendar, etc.)
3. **Given** I select a calendar format from the email link, **When** the export completes, **Then** the event is added to my calendar with all details (title, date, time, location, description)
4. **Given** the email contains the calendar export link, **When** I click it, **Then** I do not need to be logged into the platform to download the .ics file or open the calendar link

---

### User Story 4 - Event Creator Views Attendance (Priority: P3)

As an **event creator or admin**, I want to see who is attending the events in the calendar, so that I can track attendance and follow up with invitees.

**Acceptance Scenarios**:

1. **Given** I am the creator of a calendar event, **When** I view the event, **Then** I see a full list of all invited users
2. **Given** I am viewing the attendees list, **When** I look at each invitee, **Then** I can see their acceptance status (accepted, declined, tentative, no response)
3. **Given** users have responded to the event invitation, **When** I refresh the event page, **Then** the attendance status updates to reflect the latest responses
4. **Given** I am viewing the attendees section, **When** I see the list, **Then** I can see a summary count (e.g., "5 accepted, 2 declined, 3 no response")

---

### User Story 5 - User Views Other Attendees (Priority: P3)

As a **platform user** who has been invited to an event, I want to see who else is attending, so that I know who will be at the event.

**Acceptance Scenarios**:

1. **Given** I am viewing a calendar event I'm invited to, **When** I scroll to the attendees section, **Then** I see a list of users who have accepted the invitation
2. **Given** the attendees section is displayed, **When** I view the list, **Then** I can see the names and profiles of confirmed attendees
3. **Given** I am a regular attendee (not the creator), **When** I view the event, **Then** I only see users who have accepted, not those who declined or haven't responded
4. **Given** new users accept the invitation, **When** I refresh the event page, **Then** the attendees list updates to include them

---

### User Story 6 - Create Jitsi Link for Online Event (Priority: P3)

As an **event creator**, I want to automatically create a Jitsi meeting link for my online event, so that attendees can easily join the virtual meeting.

**Acceptance Scenarios**:

1. **Given** I am creating or editing a calendar event, **When** I mark it as an online event, **Then** I see an option to "Create Jitsi Link"
2. **Given** I click "Create Jitsi Link", **When** the link is generated, **Then** a unique Jitsi meeting URL is created and added to the event location field
3. **Given** a Jitsi link has been created for the event, **When** attendees view the event, **Then** they can see and click the Jitsi link to join the meeting
4. **Given** a Jitsi link is added to the event, **When** users export the event to their calendar, **Then** the Jitsi link is included in the event location or description
5. **Given** I have created a Jitsi link, **When** I view the event, **Then** I can regenerate or remove the link if needed

---

### Edge Cases

- What happens when an event spans multiple days?
- How does the system handle timezone differences between the platform and user's calendar?
- What if the event title or description contains special characters that break .ics formatting?
- What happens if the user is not signed in (can guests export events)?
- How are updates to platform events reflected in already-exported calendar events?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an "Add to Calendar" action for each calendar event
- **FR-002**: System MUST support export to at least three popular calendar formats (Google Calendar link, Outlook .ics, Apple .ics)
- **FR-003**: Exported events MUST include event title, start date/time, end date/time, and description
- **FR-004**: Exported events MUST include timezone information based on the event's configured timezone
- **FR-005**: System MUST generate valid .ics files compliant with RFC 5545 (iCalendar specification)
- **FR-006**: Exported event descriptions MUST include a link back to the original platform event
- **FR-007**: System MUST handle all-day events by setting appropriate flags in the calendar export format
- **FR-008**: System MUST include event location when present
- **FR-009**: System MUST handle special characters and formatting in event details without breaking calendar file format

### Key Entities

- **CalendarEvent**: Existing entity representing platform events with properties:
  - Title (display name)
  - Start date/time
  - End date/time
  - Whole day flag
  - Location (optional, physical or virtual)
  - Description (optional, markdown formatted)
  - Timezone
  - Type (event category)
  - Visibility settings (parent calendar visibility)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can export a calendar event in under 3 clicks from any event view
- **SC-002**: Exported calendar files are successfully imported into Google Calendar, Outlook, and Apple Calendar without errors
- **SC-003**: 100% of event details (title, dates, location, description) are accurately transferred to the exported calendar format
- **SC-004**: Users report reduced manual event creation effort (tracked via feedback or analytics)
- **SC-005**: Export functionality works for both authenticated users and guests (if applicable based on event visibility settings)
