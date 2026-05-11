# Page 31: Chat-Based Space Creator

**Route**: `/create-space/chat` (accessed via "Create Space with AI" button from space management or primary navigation)

**Audience**: All users wanting to create a new space; especially those who prefer guided conversation over forms

**Primary Use**:
- Create a new space through conversational guided questioning
- Define space structure, purpose, and initial subspaces naturally
- Select and apply templates to the space
- Understand space creation through examples and suggestions
- Review and edit space configuration before finalizing

---

## Overview & Mental Model

**Concept**: Rather than a form with fields, users have a natural conversation with an AI chatbot (similar to Spec Kit's questionnaire flow) that:
1. Asks clarifying questions about their space's purpose
2. Suggests subspace structures based on answers
3. Recommends templates based on the space type
4. Builds a visual understanding as they answer
5. Provides a summary for review/editing before creation

**Key Difference from Form-Based**:
- Conversational tone, not transactional
- Adaptive questions (not all users see all questions)
- Suggestions and recommendations (not just blank fields)
- Progressive disclosure (new questions based on previous answers)
- Context-rich (explanations of why each question matters)

---

## Entry Point: Creation Method Selection

**Route**: `/create-space` (existing space creation page)

**Current State**: Single "Create Space" button (form-based)

**New State**: Two options presented to user:

### Modal/Card: "Choose Your Creation Method"

**Layout**: Center-aligned, card-based dialog

**Option 1: Traditional Form**
- **Icon**: Form icon or document icon
- **Label**: "Use Form"
- **Description**: "Fill out fields to create your space. Fastest for users who know exactly what they want."
- **CTA Button**: "Create with Form"
- **Best for**: Experienced users, simple spaces, quick creation

**Option 2: Guided Chat (NEW)**
- **Icon**: Chat bubble icon or AI icon
- **Label**: "Guided Creation" or "Create with AI" (or "Chat-Based Creation")
- **Description**: "Have a conversation with our assistant. We'll ask questions to help you design your space structure and suggest templates."
- **CTA Button**: "Start Chat"
- **Best for**: First-time users, complex spaces, exploratory design

**Visual Design**:
- Two cards side-by-side (desktop) or stacked (mobile)
- Equal prominence (same button styling)
- Subtle icons to differentiate
- Helpful descriptions, not pushy
- No "recommended" badge (both are valid)

**States**:
1. **Default**: Both options visible, equal styling
2. **Hover Option 1**: Card slight lift, button highlight
3. **Hover Option 2**: Card slight lift, button highlight
4. **Click Form**: Navigate to existing form page
5. **Click Chat**: Navigate to chat interface

---

## Chat Interface Layout

### Overall Structure

**Left Panel (60% width, desktop; full width mobile)**: Chat conversation area (scrollable)
**Right Panel (40% width, desktop; hidden mobile)**: 
- Live preview/summary of space being created
- Shows current answers
- Shows suggested subspaces
- Shows recommended templates

**Top Bar**:
- Breadcrumb: "Create Space > Guided Chat"
- Progress indicator: "Step X of Y" or progress bar (estimated 4-6 questions)
- Close button (X) with confirmation if incomplete

**Bottom Bar**:
- Message input field
- Send button
- Typing indicator when bot is thinking

### Chat Message Styling

**User Message**:
- Right-aligned, blue background
- Rounded corners
- Clear font, adequate padding
- Shows timestamp (optional)

**Bot Message**:
- Left-aligned, light gray background
- Rounded corners, slightly more rounded corners than user
- Shows bot avatar (optional small icon/avatar)
- May contain:
  - **Text**: The question or response
  - **Suggestions**: Clickable chips/buttons with suggested answers
  - **Information**: Explanatory text or tips
  - **Visual Elements**: Cards showing examples or options

**System Message** (optional):
- Centered, italic, lighter color
- Shows status: "Creating space..." or "Analyzing your answers..."

---

## Conversation Flow & Question Structure

### Phase 1: Space Foundation (Questions 1-2)

**Q1: "What is your space about?"**

**Bot Message**:
"Hi! I'll help you design your space. Let's start with the basics. What is your space primarily about? What's its main purpose or focus area?"

**Suggested Answers** (clickable chips):
- "Innovation & Creative Problem-Solving"
- "Community Building & Collaboration"
- "Decision-Making & Strategic Planning"
- "Knowledge Management & Learning"
- "Project Delivery & Execution"
- "Custom/Other..."

**User Response**: User clicks one or types custom answer

**Bot Follow-up**: "Got it! So you're building a space for [innovation/community/etc.]. Let me learn more."

---

**Q2: "Who will use this space?"**

**Bot Message**:
"Tell me about the people who will use this space. What team, community, or audience is it for?"

**Expected Input**: User types description
- Example: "Our design team at Acme Corp"
- Example: "Open community of sustainability advocates"
- Example: "Department of 50 people"

**Bot Interpretation**: Analyzes team size, context, structure

**Follow-up Question** (adaptive):
IF community/open → "Will this space be open to the public or members-only?"
IF team/department → "Are there sub-teams or working groups within this team?"
IF small → Skip complex subspace questions
IF large → Ask about subteam structures

---

### Phase 2: Structure Design (Questions 3-4)

**Q3: "What's your workflow or process?"**

**Context**: Based on space type (from Q1), ask about their workflow

**Example for Innovation-focused space**:
"I can see you're focused on innovation. How does your process typically flow? For example:
- Do you have distinct phases (like Ideation → Development → Launch)?
- Or do you work more fluidly without stages?
- Or you're not sure yet?"

**Suggested Answers** (with descriptions):
- "Structured stages: [Ideate → Build → Execute → Evaluate]" 
  - Shows subspace example structure
- "Fluid, flexible process - we adapt as we go"
- "We follow a specific methodology (e.g., Design Thinking, Lean, Agile)"
- "Not sure yet - just exploring"

**Visual Aid**: Show example subspace structures as expandable cards

---

**Q4: "Do you need subspaces?" (only if appropriate)**

**Bot Message**:
"Based on what you've told me, here are some subspace structures I'd suggest. Subspaces are spaces within your space for specific teams, projects, or phases.

[Show 2-3 options as cards]:

**Option A: By Stage**
- Ideation (where ideas are born)
- Development (where ideas take shape)
- Execution (where ideas launch)
- Review (post-launch reflection)

**Option B: By Team**
- Design Team
- Engineering Team
- Product Team
- Operations Team

**Option C: By Project**
- Project Alpha
- Project Beta
- Cross-functional Initiatives

**Or: No subspaces yet - keep it simple for now**"

**User Response**: Click option or "Custom" to define own

**If Custom**:
- Bot asks: "What subspaces do you need? You can list them or describe them."
- User types: "Research, Strategy, Execution, Feedback"
- Bot confirms understanding and visualizes in preview

---

### Phase 3: Template Selection (Questions 5-6)

**Q5: "Would you like template suggestions?"**

**Bot Message**:
"Great! I have a good sense of your space now. Would you like me to recommend some templates to get you started? These are pre-built structures and content templates that can save you time.

Or if you prefer, you can always add templates after creation."

**Suggested Answers**:
- "Yes, show me recommendations"
- "No thanks, I'll set it up manually"
- "Not sure - what are templates?"

**If "Not sure"**:
- Bot explains: "Templates are like blueprints. For example, a 'Decision-Making' template gives you pre-made posts for gathering proposals, discussing options, making decisions, and documenting outcomes. You can customize everything after."

---

**Q6: "Which templates interest you?" (only if yes to Q5)**

**Bot Message**:
"Based on your [innovation/collaborative] space, here are templates I recommend:

[Show 3-5 template recommendations as cards with]:
- Template name
- Brief description
- Tags (e.g., "Innovation", "Brainstorming")
- "Add to Space" button

**Other recommended templates:**
[Show 2-3 more with less prominence]

**Or browse all templates →**"

**User Response**: Click "Add to Space" on templates they want (multi-select)

**Visual Feedback**: Selected templates show checkmark or highlighted state

---

### Phase 4: Confirmation & Summary

**Q7: "Review Your Space"** (not really a question, but the summary step)

**Bot Message**:
"Perfect! Here's what I've configured for your space. Review everything, and you can make changes before we create it."

**Transition to Summary Screen** (see below)

---

## Summary/Review Screen

**Route**: Triggered after conversation completion

**Layout**: Two-column
- **Left (60%)**: Editable form preview
- **Right (40%)**: Visual summary/checklist

### Left Column: Editable Summary Form

**Section 1: Space Details**
- **Name**: Text input field (populated with answer or default)
  - User can edit
- **Description**: Text area (populated with conversation context)
  - User can edit
- **Visibility**: Dropdown (private, members-only, public)
  - Suggested based on answers, editable
- **Purpose/Focus**: Display of their answer
  - Edit button to change

**Section 2: Subspaces**
- **List of subspaces** (if any)
  - Each as a row: [Name] [Purpose] [Edit] [Delete]
  - "Add another subspace" button
  - Drag to reorder

**Section 3: Templates**
- **Selected templates** displayed as cards or list
  - Thumbnail, name, description
  - [Remove] button per template
  - "Browse more templates" link

**Section 4: Additional Settings** (optional, collapsible)
- Host/Admin (pre-filled with current user)
- Membership requirements
- Application process (if applicable)

### Right Column: Visual Summary

**Card 1: Space Overview**
- Space name (prominent)
- Description (1-2 lines)
- Visibility badge
- "X members expected" (if provided)

**Card 2: Subspace Structure**
- Visual hierarchy/tree of subspaces
- Icons for each (if applicable)
- Shows how space will be organized

**Card 3: Templates Being Applied**
- List of templates with checkmarks
- Count: "X templates will be applied"
- "Review all templates" link

**Card 4: Estimated Onboarding**
- "Your space will include: X subspaces, Y templates, Z initial post templates"
- Helps user understand what to expect

### Action Buttons (Bottom)

**Left**: "Back to Chat" or "Edit Answers" (reopen chat to change answers)
**Center/Right**: 
- Secondary: "Cancel & Start Over"
- Primary: "Create Space" (with loading state when clicked)

---

## Conversation Examples

### Example 1: Simple Space (No Subspaces)

**User**: Innovation team of 5 people, first time using the platform

**Q1**: "What is your space about?"
**User clicks**: "Innovation & Creative Problem-Solving"

**Q2**: "Who will use this space?"
**User types**: "Small design team at our startup"

**Bot** (adaptive, Q3): "Nice! For a small team, do you need subspaces, or would you rather keep it simple?"
**User clicks**: "Keep it simple for now"

**Q5**: "Want templates?"
**User clicks**: "Yes, show me"

**Q6**: Templates recommended: "Brainstorming", "Decision-Making", "User Research"
**User**: Selects all 3

**→ Summary screen shows**: 1 space (no subspaces), 3 templates

---

### Example 2: Complex Space (Multi-Subspace)

**User**: Department of 40 people with multiple teams

**Q1**: "What is your space about?"
**User clicks**: "Project Delivery & Execution"

**Q2**: "Who will use this space?"
**User types**: "Our entire department - design, engineering, product, operations. We run multiple projects simultaneously."

**Q3**: "What's your workflow?"
**User clicks**: "Structured stages: we follow a phase-based approach"

**Bot** (adaptive, Q4): "Perfect! Given your multiple teams and projects, let me suggest structures. Which approach resonates?

**Option A: By Phase + Team** (Recommended)
- Design Phase (all teams contribute)
  - Design Team
  - Engineering Review
- Development Phase
  - Engineering Team
  - Product Feedback
- Launch Phase
  - All teams coordinate

**Option B: By Team + Project**
- Design Team (sub-projects within)
- Engineering Team (sub-projects within)
- Product Team

**Option C: By Project**
- Project Alpha (Design, Engineering, Product collaborate)
- Project Beta
- Project Gamma

**User clicks**: "Option A - that matches how we work"

**Bot** (Q5): "Excellent! Templates would really help here. Should I recommend some?"
**User clicks**: "Yes"

**Q6**: Templates recommended: "Project Planning", "Phase-Based Workflow", "Cross-Functional Coordination", "Decision Documentation", "Status Updates"
**User**: Selects 4 of 5

**→ Summary screen shows**: 1 main space, 2-4 subspaces (with nested structure), 4 templates

---

## Bot Behaviors & Intelligence

### Adaptive Questioning

**Rules**:
- Skip Q3 "workflow" if user said "keep it simple"
- Skip Q4 "subspaces" if team size < 5 or user said "simple"
- Suggest subspace structures based on Q1 (innovation) + Q2 (team size/structure)
- Adjust template recommendations based on space type + structure

### Suggestion Logic

**Templates recommended based on**:
- Space type (from Q1)
- Workflow (from Q3)
- Subspace count (from Q4)
- Team size (from Q2)

**Example**: 
- If "Innovation" + "Structured Stages" → Recommend "Phase-Based Workflow" template
- If "Community" + "Open/Public" → Recommend "Community Guidelines", "Discussion Moderation" templates
- If "Multiple Teams" → Recommend "Cross-Team Coordination" template

### Conversational Tone

**Bot Personality**:
- Helpful, not prescriptive
- Acknowledges user's context
- Offers alternatives
- Explains reasoning
- Uses "we" (collaborative)
- Occasionally uses emojis (sparingly, tastefully)

**Example messages**:
- "Got it! That's a strong foundation. Here's what I'm thinking... [suggestions]"
- "I notice you mentioned multiple teams. That suggests you might benefit from subspaces for [X]. Make sense?"
- "Love the focus on [X]. Here are templates that are popular for [X] spaces..."

---

## Visual Design Requirements

### Chat Interface

**Colors & Styling**:
- User messages: Primary brand color (blue), white text, right-aligned
- Bot messages: Light gray background (#F5F5F5), left-aligned
- Suggested answer chips: Light blue background, dark text, rounded pill shape
- Hover on chip: Darker background, cursor pointer
- Selected chip: Solid primary color, white text

**Typography**:
- Bot message text: Body Regular (16px)
- Suggested answers: Label Small (14px), semi-bold
- Timestamps (optional): Caption (12px), gray color

**Spacing**:
- Messages: 16px margin between messages
- Padding inside message: 12px horizontal, 16px vertical
- Input field: 16px padding, subtle border on focus

### Preview Panel (Right Side)

**Desktop Only (1024px+)**:
- Fixed width (40%)
- Sticky/scrolls with chat
- Light background (#FAFAFA)
- Padding: 24px
- Cards with subtle borders
- Visual hierarchy clear (headings, content)

**Mobile**: Hidden (full-screen chat)

### Input Area

**Bottom of screen**:
- Message input field (flexible height, max ~100px)
- Send button (right side of input)
- Suggest buttons visible above input (optional, for quick replies)
- Input styling: light border, focus state shows blue outline

---

## States & Scenarios

### Loading States

**Bot Thinking**:
- "..." animated dots
- Or: "Analyzing your response..."
- Shows for 1-2 seconds while bot generates next question

**Conversation Transition**:
- Message appears gradually (typewriter effect optional)
- Suggested answers appear after message completes

### Error States

**Invalid/Unclear Response**:
- Bot asks for clarification: "I'm not sure I understood. Could you rephrase?"
- Offers suggestions if available
- Doesn't move forward until answer understood

**Connection Error**:
- Graceful degradation: "I'm having trouble connecting. Your answers have been saved."
- Option to retry or save and continue later
- Fallback to form-based creation

### Edge Cases

**User Closes Chat Mid-Way**:
- Confirmation modal: "Your progress will be saved. You can return to this chat later."
- Option: "Save & Come Back Later" or "Discard"
- If saved, next time they click "Create Space", prompt: "Continue your chat?" with resume button

**User Wants to Change Approach**:
- Button in chat header: "Switch to Form" 
- Warning: "You'll lose your chat progress but answers will transfer to the form"
- User confirms before switching

**User Wants to Skip a Question**:
- Message: "I'll skip this one" or "Not sure"
- Bot: Offers to come back later or uses smart defaults
- Continues to next question

---

## Post-Creation Experience

### Success State

**After "Create Space" button clicked**:
1. Loading animation (spinner + "Creating your space...")
2. Success message: "Your space is ready! 🎉"
3. Auto-redirect to new space (2-3 second delay)
4. Option: "Go to Space" CTA button

### Next Steps Screen (Optional)

**After space creation, show onboarding**:
- "Welcome to [Space Name]!"
- Quick tips:
  - "Your subspaces are ready to use"
  - "Templates have been applied - customize as needed"
  - "Invite team members to get started"
- CTA buttons:
  - "Invite Members"
  - "View Space"
  - "Edit Settings"

---

## Mobile Considerations

### Mobile Layout

**Chat Interface**:
- Full screen, single column
- No right preview panel (hidden)
- Messages take full width
- Input field sticks to bottom

**Preview Access**:
- "Peek at Summary" button or swipe gesture to slide in preview from right
- Or: Full-screen preview modal on bottom sheet

**Responsive Breakpoints**:
- **Mobile (< 768px)**: Single column, chat full width
- **Tablet (768px-1024px)**: Chat 60%, preview 40% (side-by-side)
- **Desktop (1024px+)**: Chat 60%, preview 40% (side-by-side, sticky)

---

## Accessibility & Usability

### Keyboard Navigation

- Tab through suggested answer chips
- Enter to select chip or send message
- Escape to close any modals
- Focus indicators visible on all interactive elements

### Screen Reader Support

- Chat messages announced with speaker role ("User says..." or "Assistant says...")
- Suggested answers announced as buttons with descriptions
- Form fields labeled properly in summary screen
- Landmarks used (main chat area, preview panel, controls)

### Color Contrast

- User message: Blue on white (high contrast)
- Bot message: Gray on white (tested for WCAG AA)
- Buttons: High contrast primary color

### Language & Tone

- Clear, simple language
- Avoid jargon
- Explanations for technical terms
- Examples provided
- Optional "Learn more" links to documentation

---

## Comparison: Chat vs. Form

| Aspect | Chat | Form |
|--------|------|------|
| **Speed** | 5-7 min, conversational | 3-5 min, direct entry |
| **Guidance** | Heavy, explained at each step | Minimal, labels only |
| **Complexity** | Handles complex designs well | Requires user to know structure |
| **Flexibility** | Adaptive questions | All questions asked |
| **First-Time UX** | Very good (feels natural) | Okay (can be overwhelming) |
| **Expert UX** | Slower (extra explanation) | Faster (skip unnecessary) |
| **Recommendation** | New users, complex spaces | Returning users, simple spaces |

---

## Implementation Notes

### Backend Integration

**Data Collection**:
- Store each message in conversation history
- Parse user responses to extract:
  - Space name/description
  - Subspace structure
  - Template selections
  - Visibility settings
  - Team size/context
- Use NLP or templated parsing to understand intent

**AI/Chatbot**:
- Can be rule-based (if/else logic) for MVP
- Or use GPT-like model for more natural feel
- Ensure responses are deterministic and safe
- Rate limit to prevent abuse

**Summary Screen**:
- Display parsed data from conversation
- Allow editing before final creation
- Store conversation for future reference/auditing

### Design System Integration

**Components Used**:
- Message bubbles (custom molecule)
- Input field (atom)
- Button, chip, card components (atoms/molecules)
- Modal (organism)
- Form fields (atoms/molecules)

---

## Success Metrics

- **Completion Rate**: % of users who finish chat → create space
- **Time to Completion**: Average time for chat completion
- **Complexity Adopted**: % of users creating multi-subspace spaces via chat
- **Template Adoption**: % of recommended templates applied
- **User Satisfaction**: NPS/survey after space creation
- **Fallback Rate**: % switching from chat to form mid-way (should be low)

---

## Notes for Figma Make Execution

1. **Show full chat conversation example** (5-7 message exchanges)
2. **Show preview panel** (right side) with live updates as conversation progresses
3. **Show summary/review screen** with editable form
4. **Show mobile layout** (full-screen chat, preview on bottom sheet)
5. **Show all states**: Loading, error, success, focus states
6. **Show 2-3 example flows**: Simple space, complex multi-subspace, community space
7. **Document bot personality** through message examples
8. **Show responsive breakpoints**: Mobile, tablet, desktop

---
