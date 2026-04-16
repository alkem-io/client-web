 ---                                                                                                                                                                                 
  Specification Analysis Report: CRD Whiteboard Migration
                                                                                                                                                                                      
  Findings Table                                  
                                                                                                                                                                                      
  ID: F1                                                                                                                                                                              
  Category: Inconsistency                                               
  Severity: HIGH                                                                                                                                                                      
  Location(s): tasks.md Phase 3 T12, Phase 4 T16, Phase 5 T17           
  Summary: Preview settings dialog: MUI or CRD? T12 (CrdWhiteboardDialog) says "Renders WhiteboardPreviewSettingsDialog (stays MUI, portals out)". T16 (CrdSingleUserWhiteboardDialog)
                                                                                                                                                                                      
    says "Renders PreviewSettingsDialog (CRD, from Phase 6)". T17 creates the CRD version in Phase 5. But there is no task to update T12 to use the CRD PreviewSettingsDialog after
    Phase 5 delivers it. The multi-user dialog permanently references MUI preview settings.                                                                                           
  Recommendation: Add a task in Phase 5 or 6 to replace the MUI WhiteboardPreviewSettingsDialog import in CrdWhiteboardDialog with the CRD PreviewSettingsDialog.
  ────────────────────────────────────────
  ID: F2                                                                                                                                                                              
  Category: Inconsistency
  Severity: MEDIUM                                                                                                                                                                    
  Location(s): tasks.md T16                       
  Summary: Wrong phase reference. T16 says "Renders PreviewSettingsDialog (CRD, from Phase 6)" but the CRD PreviewSettingsDialog is created in Phase 5 (T17). Phase 6 is "Full Public
    Page + Demo App".
  Recommendation: Fix reference: "from Phase 5" not "from Phase 6".
  ────────────────────────────────────────
  ID: F3                                                                                                                                                                              
  Category: Inconsistency
  Severity: MEDIUM                                                                                                                                                                    
  Location(s): tasks.md                           
  Summary: Missing task T14. Task numbering jumps from T13 to T15. Cosmetic but confusing for cross-referencing and progress tracking.
  Recommendation: Renumber or add a note explaining the gap.
  ────────────────────────────────────────
  ID: F4                                                                                                                                                                              
  Category: Coverage
  Severity: MEDIUM                                                                                                                                                                    
  Location(s): spec FR-WB-028, tasks T10          
  Summary: Focus trapping underspecified in task. FR-WB-028 requires "Focus must be trapped within the editor shell dialog when open." T10's acceptance criteria mention preventing
    onOpenAutoFocus but don't explicitly address focus trapping. Radix Dialog provides this by default, but it should be called out as an acceptance criterion since Excalidraw's own
    focus management may conflict.
  Recommendation: Add to T10 acceptance: "Focus trapping works correctly (Radix default); verify no conflict with Excalidraw internal focus."
  ────────────────────────────────────────
  ID: F5                                                                                                                                                                              
  Category: Inconsistency
  Severity: MEDIUM                                                                                                                                                                    
  Location(s): data-model.md, tasks T9            
  Summary: Prop type name mismatch. T9 says "Props: see data-model.md WhiteboardFooterProps" but the data model defines the type as WhiteboardCollabFooterProps.
  Recommendation: Fix T9 reference to WhiteboardCollabFooterProps.
  ────────────────────────────────────────
  ID: F6                                                                                                                                                                              
  Category: Coverage
  Severity: MEDIUM                                                                                                                                                                    
  Location(s): spec FR-WB-008, tasks T6           
  Summary: Guest session behavioral parity not testable. FR-WB-008: "Guest session flow (name storage, derived name, analytics) must work identically to MUI version." T6 mentions
    reusing hooks but acceptance criteria don't include specific guest session verification steps.
  Recommendation: Add to T6 acceptance: "Verify guest name persists in session storage (alkemio_guest_name), derived anonymized names work for authenticated users, and analytics
    events fire."
  ────────────────────────────────────────
  ID: F7                                                                                                                                                                              
  Category: Dependency
  Severity: LOW                                                                                                                                                                       
  Location(s): tasks dependency graph, T10        
  Summary: False dependency slows critical path. T10 (WhiteboardEditorShell) depends on T8 (DisplayName) and T9 (CollabFooter), but the shell only accepts ReactNode slots (title,
    footer). It doesn't import these components. T10 could be built in parallel with T8/T9 and tested with mock ReactNode children.
  Recommendation: Remove T8/T9 as hard dependencies of T10. T10 only needs T3 (i18n for close button label). Test with <div>mock title</div> etc.
  ────────────────────────────────────────
  ID: F8                                                                                                                                                                              
  Category: Underspecification
  Severity: LOW                                                                                                                                                                       
  Location(s): spec, plan, tasks                  
  Summary: window.confirm() for unsaved changes (FR-WB-032). The spec preserves the MUI behavior of using window.confirm(). This is browser-native and non-stylable. Consider whether
    this should remain or be replaced with a CRD ConfirmationDialog for visual consistency. If intentional, document the rationale.
  Recommendation: Document decision explicitly: "window.confirm() is intentionally preserved for simplicity; a CRD confirmation dialog is a future enhancement."
  ────────────────────────────────────────
  ID: F9                                                                                                                                                                              
  Category: Ambiguity
  Severity: LOW                                                                                                                                                                       
  Location(s): plan section 1, spec               
  Summary: Fullscreen vs windowed mode trigger. Plan says "When fullscreen is true, dialog fills 100vw x 100vh. When false, uses max-w-[95vw] max-h-[90vh]." But it's unclear what
    determines the fullscreen prop. The existing MUI uses fullScreen={true} always on small screens + a toggle. The spec/plan don't specify the responsive breakpoint behavior.
  Recommendation: Clarify in plan: "fullscreen defaults to true on sm breakpoints and below, toggleable via FullscreenButton on larger screens" (matching current MUI behavior).
  ────────────────────────────────────────
  ID: F10                                                                                                                                                                             
  Category: Coverage
  Severity: LOW                                                                                                                                                                       
  Location(s): spec FR-WB-043, tasks T21          
  Summary: Static screenshot asset not specified. T21 requires a PNG screenshot for the demo page but doesn't specify where it comes from, what filename, or where it's stored.
  Recommendation: Add to T21: "Export a real whiteboard canvas screenshot and save as src/crd/app/data/whiteboard-screenshot.png (or similar)."
  ────────────────────────────────────────
  ID: F11                                                                                                                                                                             
  Category: Categorization
  Severity: LOW                                                                                                                                                                       
  Location(s): spec FR-WB-041                     
  Summary: Not a functional requirement. "react-image-crop is acceptable inside src/crd/" is a design decision/exemption, not a functional requirement.
  Recommendation: Move to a "Design Decisions" section or keep as-is (non-blocking).

  Coverage Summary Table                                                                                                                                                              
  
  ┌──────────────────────────────────────┬───────────┬──────────┬─────────────────────────────────────────┐                                                                           
  │           Requirement Key            │ Has Task? │ Task IDs │                  Notes                  │
  ├──────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤                                                                           
  │ FR-WB-001 (Join dialog CRD)          │ Yes       │ T4       │                                         │
  ├──────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤
  │ FR-WB-002 (Name validation)          │ Yes       │ T4       │                                         │                                                                           
  ├──────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤
  │ FR-WB-003 (Sign-in button)           │ Yes       │ T4       │                                         │                                                                           
  ├─────────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤                                                                        
  │ FR-WB-004 (Error icon/title/message)    │ Yes       │ T5       │                                         │
  ├─────────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤                                                                        
  │ FR-WB-005 (Error type detection)        │ Yes       │ T5, T6   │ Detection in T6 integration layer       │
  ├─────────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤                                                                        
  │ FR-WB-006 (Full-viewport layout)        │ Yes       │ T6       │                                         │
  ├─────────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤                                                                        
  │ FR-WB-007 (Route toggle)                │ Yes       │ T7       │                                         │
  ├─────────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤                                                                        
  │ FR-WB-008 (Guest session parity)        │ Partial   │ T6       │ Acceptance criteria underspecified (F6) │
  ├─────────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤                                                                        
  │ FR-WB-009 (Auth skip join)              │ Yes       │ T6       │ Implicit in reuse of existing logic     │
  ├─────────────────────────────────────────┼───────────┼──────────┼─────────────────────────────────────────┤                                                                        
  │ FR-WB-010 (Disabled guest = 404)        │ Yes       │ T6       │                                         │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-011 (Full-screen dialog)          │ Yes       │ T10      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-012 (Header layout)               │ Yes       │ T10      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-013 (DisplayName 3 modes)         │ Yes       │ T8       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-014 (DisplayName save)            │ Yes       │ T8       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-015 (Footer layout)               │ Yes       │ T9       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-016 (Delete button)               │ Yes       │ T9       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤
  │ FR-WB-017 (Readonly message)            │ Yes       │ T9       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-018 (Guest warning badge)         │ Yes       │ T9       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-019 (Guest access badge slot)     │ Yes       │ T9       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-020 (onClose passthrough)         │ Yes       │ T10      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-021 (Children flex-grow)          │ Yes       │ T10      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-022 (Join dialog aria-labelledby) │ Yes       │ T4       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-023 (Input aria-label)            │ Yes       │ T4       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-024 (Submit aria-busy)            │ Yes       │ T4       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-025 (Shell dialog aria-label)     │ Yes       │ T10      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-026 (Delete aria-label)           │ Yes       │ T9       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-027 (DisplayName aria-labels)     │ Yes       │ T8       │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-028 (Focus trapping)              │ Partial   │ T10      │ Implicit via Radix but not in acceptance (F4) │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-029 (Escape → close)              │ Yes       │ T10      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-030 (Save footer)                 │ Yes       │ T15      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-031 (Save disabled)               │ Yes       │ T15      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-032 (Unsaved changes confirm)     │ Yes       │ T16      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-033 (ExcalidrawWrapper usage)     │ Yes       │ T16      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-034 (Preview 3 modes)             │ Yes       │ T17      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-035 (Selected mode highlight)     │ Yes       │ T17      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-036 (Auto saves immediately)      │ Yes       │ T17      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-037 (Custom/Fixed → crop)         │ Yes       │ T17      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-038 (Crop dialog features)        │ Yes       │ T18      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-039 (Reset/Cancel/Confirm)        │ Yes       │ T18      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-040 (onCropSave callback)         │ Yes       │ T18      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-041 (react-image-crop OK)         │ N/A       │ --       │ Design decision, not task                     │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-042 (Zero Excalidraw in crd/)     │ Yes       │ T23      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-043 (Demo uses static PNG)        │ Yes       │ T21      │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-044 (No Excalidraw types in crd/) │ Yes       │ T23      │ Covered by grep check                         │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-045 (crd-whiteboard namespace)    │ Yes       │ T1, T3   │                                               │
  ├─────────────────────────────────────────┼───────────┼──────────┼───────────────────────────────────────────────┤                                                                  
  │ FR-WB-046 (6 languages)                 │ Yes       │ T1, T2   │                                               │
  └─────────────────────────────────────────┴───────────┴──────────┴───────────────────────────────────────────────┘                                                                  
                                                  
  Constitution Alignment Issues                                                                                                                                                       
  
  No CRITICAL violations found. The spec aligns well with the constitution:                                                                                                           
                                                  
  - Principle I (Domain Boundaries): CRD components are pure presentation; domain logic stays in integration layer. The whiteboardFooterMapper is a pure function. Footer receives    
  pre-rendered ReactNode for readonly messages to avoid routing leakage.
  - Principle II (React 19): Existing window.confirm() behavior preserved (not a new pattern). No new concurrency concerns introduced.                                                
  - Principle III (GraphQL Fidelity): CRD components have zero GraphQL imports. Integration layer uses existing generated hooks.                                                      
  - Principle IV (State Isolation): CRD components use useState only for visual state (edit mode, input value).                                                                       
  - Principle V (Accessibility): 8 accessibility FRs (FR-WB-022 through FR-WB-029) cover all interactive elements.                                                                    
  - Architecture Standard 2: New components use CRD design system.                                                                                                                    
  - Architecture Standard 5: No barrel exports pattern followed.                                                                                                                      
  - SOLID/OCP: Slot pattern (children, footer, headerActions as ReactNode) follows Open/Closed well.                                                                                  
                                                                                                                                                                                      
  Unmapped Tasks                                                                                                                                                                      
                                                                                                                                                                                      
  None — all tasks map to at least one requirement.                                                                                                                                   
          
  Metrics                                                                                                                                                                             
                                                  
  ┌───────────────────────────────┬──────────────────────────────────────────────────────────┐
  │            Metric             │                          Value                           │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ Total Functional Requirements │ 46                                                       │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ Total Tasks                   │ 23 (T1-T25, skipping T14)                                │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ Coverage %                    │ 97.8% (45/46 have tasks; FR-WB-041 is a design decision) │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ Ambiguity Count               │ 1 (F9: fullscreen breakpoint)                            │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ Duplication Count             │ 0                                                        │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ Critical Issues Count         │ 0                                                        │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ High Issues Count             │ 1 (F1: preview settings MUI→CRD gap)                     │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ Medium Issues Count           │ 4                                                        │
  ├───────────────────────────────┼──────────────────────────────────────────────────────────┤                                                                                        
  │ Low Issues Count              │ 4                                                        │
  └───────────────────────────────┴──────────────────────────────────────────────────────────┘                                                                                        
                                                  
  ---     
  Codebase Verification Summary
                               
  All 12 existing MUI components were verified against the spec. Line counts, hook usage, render patterns, and behavioral claims all match the actual code. No discrepancies between
  spec descriptions and the current codebase. The CollaborativeExcalidrawWrapper render prop pattern returns exactly the props described. The react-image-crop package is already     
  installed (v10.1.8).
                                                                                                                                                                                      
  ---                                             
  Next Actions
              
  The spec suite is in good shape — no CRITICAL issues, one HIGH that's straightforward to fix.
                                                                                                                                                                                      
  1. Fix F1 (HIGH): Add a task to replace MUI WhiteboardPreviewSettingsDialog in CrdWhiteboardDialog with the CRD version after Phase 5 delivers it. Without this, the multi-user     
  editor permanently uses MUI preview settings.                                                                                                                                       
  2. Fix F2-F3: Correct the phase reference in T16 and address the T14 numbering gap.                                                                                                 
  3. Fix F5: Correct the prop type name reference in T9.                                                                                                                              
  4. Optionally address F4, F6-F10 (MEDIUM/LOW): These improve clarity but don't block implementation.    
