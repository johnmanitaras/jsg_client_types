# Client Types Management - UX Concept Document

**Document Version**: 1.1
**Created**: December 12, 2025
**Updated**: December 12, 2025 (Industry feedback incorporated)
**Application**: jsg_client_types
**Purpose**: Define the user experience for managing client type classifications in JetSetGo

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [User Context and Goals](#2-user-context-and-goals)
3. [Information Architecture](#3-information-architecture)
4. [Page Layout and Structure](#4-page-layout-and-structure)
5. [Component Specifications](#5-component-specifications)
6. [User Interactions and Flows](#6-user-interactions-and-flows)
7. [State Management](#7-state-management)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility Requirements](#9-accessibility-requirements)
10. [Implementation Notes](#10-implementation-notes)

---

## 1. Executive Summary

### Purpose

The Client Types Management app provides transport and tourism operators with a simple, focused interface to manage customer classifications. These classifications (e.g., "Individual", "Corporate", "Travel Agent", "VIP") are used throughout the JetSetGo platform to categorize customers, apply pricing rules, and control access to agent-specific features.

### Design Philosophy

This is a **configuration screen**, not a primary workflow tool. Users will visit infrequently to set up or adjust their client classifications. The design prioritizes:

- **Clarity**: Immediately understand what each client type is and its status
- **Efficiency**: Complete common tasks (create, edit, reorder) with minimal clicks
- **Safety**: Prevent accidental deletions with confirmation dialogs
- **Simplicity**: No unnecessary complexity - this is a straightforward list management interface

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single-page layout with inline editing via modal | Reduces navigation complexity for a simple CRUD interface |
| Table-based list view | Client types have few fields; a table provides the best scanability |
| Drag-and-drop reordering with fallback buttons | Primary method is intuitive; fallback ensures accessibility. Sort order controls dropdown display in booking forms |
| Soft delete pattern (inactive toggle) | Prevents data loss; maintains referential integrity |
| Modal-based create/edit | Keeps user context; forms are simple enough for modal treatment |
| Client usage count display | Shows how many clients use each type - critical for safe deactivation/deletion |
| Default type indicator | One type must be marked as default for new clients/walk-ups |
| Always-visible search | Operators start searching at 6-7 items; hiding adds friction |

---

## 2. User Context and Goals

### Primary Users

**System Administrators and Operations Managers** who configure the booking system. They typically:

- Have moderate technical comfort
- Perform this task infrequently (initial setup, then occasional adjustments)
- Need to understand the implications of changes (e.g., deactivating a client type)
- May be interrupted during configuration tasks

### User Goals

| Goal | Priority | Success Criteria |
|------|----------|------------------|
| View all client types at a glance | High | All types visible without scrolling (typical case of 5-10 types) |
| Create a new client type | High | Complete in under 30 seconds |
| Edit an existing client type | High | Find and modify in under 20 seconds |
| Set default client type | High | One type clearly marked as default for new clients |
| See usage impact before changes | High | Client count visible - prevents accidental data issues |
| Reorder client types for display | Medium | Intuitive drag-drop or clear up/down controls; affects booking form dropdowns |
| Identify agent-type classifications | Medium | Visual indicator clearly distinguishes agents |
| Deactivate without deleting | Medium | Toggle with clear status feedback |
| Delete unused client types | Low | Confirmation with impact warning prevents accidents |

### User Journey Context

Users arrive at this screen from:
- Initial system setup wizard
- Settings/Configuration menu in the wrapper navigation
- Direct deep link from other parts of the system

They leave by:
- Navigating to another configuration area
- Returning to main dashboard
- Closing the browser/session

---

## 3. Information Architecture

### Data Model

```
ClientType {
  id: UUID (read-only)
  name: string (required, 1-100 characters)
  description: string (optional, 0-500 characters)
  agent: boolean (default: false)
  is_active: boolean (default: true)
  sort_order: integer (auto-managed)
  created_at: timestamp (read-only)
  updated_at: timestamp (read-only)

  // Computed/derived fields (from related data):
  client_count: integer (read-only, number of clients using this type)
  is_default: boolean (only one type can be default at a time)
}
```

**Note on Default Type**: The system requires exactly one client type to be marked as default. This type is automatically assigned to:
- Walk-up customers at point of sale
- Online bookings where customer doesn't specify
- API integrations that don't provide a type

**Note on Sort Order**: This controls the display order in booking form dropdowns throughout the platform. Operators typically want their most common types at the top.

### Content Hierarchy

```
Page
├── Header Section
│   ├── Page Title: "Client Types"
│   ├── Page Description: Brief explanation of purpose
│   └── Primary Action: "Add Client Type" button
│
├── Filter/Search Bar (always visible)
│   ├── Search Input
│   └── Status Filter (All / Active / Inactive)
│
└── Client Types Table
    ├── Column Headers (with sort indicators)
    │   ├── Drag Handle (no header)
    │   ├── Name (with Default star indicator)
    │   ├── Description
    │   ├── Type (Agent badge)
    │   ├── In Use (client count)
    │   ├── Status Toggle
    │   └── Actions
    │
    └── Table Rows (one per client type)
        ├── Drag Handle Icon
        ├── Name (primary text) + Default Star (if default type)
        ├── Description (secondary text, truncated)
        ├── Agent Badge (if applicable)
        ├── Client Count (e.g., "47 clients")
        ├── Active/Inactive Toggle
        └── Actions Menu (Edit, Set as Default, Delete)
```

### Display Priority

When space is limited (mobile/narrow embedded), prioritize:
1. Name + Default indicator (always visible)
2. Status toggle (always visible)
3. Client count (always visible - critical for operational decisions)
4. Actions (always accessible via menu)
5. Agent indicator (visible as badge or icon)
6. Description (hidden on mobile, shown on hover/expansion)

---

## 4. Page Layout and Structure

### Desktop Layout (1024px+)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Client Types                                              [Add Client Type]  │
│  Manage customer classifications for your booking system                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐     │
│  │ CARD: Client Types List                                              │     │
│  │                                                                       │     │
│  │  ┌──────────────────────────────────────────────────────────────┐   │     │
│  │  │ [Search...]                              [Status: All ▼]      │   │     │
│  │  └──────────────────────────────────────────────────────────────┘   │     │
│  │                                                                       │     │
│  │  ┌────────────────────────────────────────────────────────────────────────┐   │
│  │  │ ⋮⋮ │ NAME            │ DESCRIPTION       │ TYPE  │ IN USE      │ STATUS │ ••• │
│  │  ├────────────────────────────────────────────────────────────────────────┤   │
│  │  │ ⋮⋮ │ ★ Individual    │ Standard customers│       │ 1,247 clients│ [====] │ ••• │
│  │  │ ⋮⋮ │ Corporate       │ Business accounts │       │ 156 clients  │ [====] │ ••• │
│  │  │ ⋮⋮ │ Travel Agent    │ Partner agencies  │ Agent │ 23 clients   │ [====] │ ••• │
│  │  │ ⋮⋮ │ VIP             │ Premium customers │       │ 89 clients   │ [====] │ ••• │
│  │  │ ⋮⋮ │ Staff           │ Internal bookings │       │ 0 clients    │ [----] │ ••• │
│  │  └────────────────────────────────────────────────────────────────────────┘   │
│  │                                                                       │     │
│  │  Showing 5 client types                                              │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1023px)

- Same structure as desktop
- Description column may be truncated or shown as tooltip
- Drag handles remain functional

### Mobile Layout (< 768px)

```
┌───────────────────────────────────┐
│ Client Types          [+ Add]    │
│ Manage customer classifications  │
├───────────────────────────────────┤
│                                   │
│ ┌───────────────────────────────┐ │
│ │ [Search client types...]      │ │
│ └───────────────────────────────┘ │
│                                   │
│ ┌───────────────────────────────┐ │
│ │ ≡ ★ Individual         [===] │ │
│ │   1,247 clients  •  Default   │ │
│ ├───────────────────────────────┤ │
│ │ ≡ Corporate            [===] │ │
│ │   156 clients                 │ │
│ ├───────────────────────────────┤ │
│ │ ≡ Travel Agent   Agent [===] │ │
│ │   23 clients                  │ │
│ ├───────────────────────────────┤ │
│ │ ≡ VIP                  [===] │ │
│ │   89 clients                  │ │
│ ├───────────────────────────────┤ │
│ │ ≡ Staff                [---] │ │
│ │   0 clients  •  Inactive      │ │
│ └───────────────────────────────┘ │
│                                   │
│ 5 client types                    │
└───────────────────────────────────┘
```

On mobile:
- List view replaces table
- Each item is a tappable card
- Swipe actions for quick toggle/delete (optional enhancement)
- Tap to expand and see full details + edit/delete options

---

## 5. Component Specifications

### 5.1 Page Header

**Structure:**
```tsx
<div className="container py-6">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold">Client Types</h1>
      <p className="text-sm text-gray-600 mt-2">
        Manage customer classifications for your booking system
      </p>
    </div>
    <button className="btn-primary">
      <Plus size={20} className="mr-2" />
      Add Client Type
    </button>
  </div>
</div>
```

**CSS Variables:**
- Title: `var(--text-2xl)`, `var(--font-weight-bold)`, `var(--color-text)`
- Subtitle: `var(--text-sm)`, `var(--color-text-secondary)`
- Button height: `var(--height-button)` (52px)
- Spacing: `var(--spacing-6)` for vertical padding

### 5.2 Search and Filter Bar

**Visibility:** Always visible. Operators start searching at 6-7 items; hiding the search adds unnecessary friction.

**Structure:**
```tsx
<div className="flex gap-3 mb-4">
  <div className="flex-1 relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
    <input 
      type="text"
      placeholder="Search client types..."
      className="input pl-10 w-full"
    />
  </div>
  <select className="select w-48">
    <option value="all">All Status</option>
    <option value="active">Active Only</option>
    <option value="inactive">Inactive Only</option>
  </select>
</div>
```

**CSS Variables:**
- Input height: `var(--height-input)` (40px)
- Input border: `var(--input-borderColor)`
- Focus ring: `var(--focus-borderColor)`, `var(--focus-ringWidth)`

### 5.3 Client Types Table

**Column Specifications:**

| Column | Width | Alignment | Content |
|--------|-------|-----------|---------|
| Drag Handle | 40px | Center | GripVertical icon, cursor: grab |
| Name | flex-1 (min 150px) | Left | Text, font-weight: 500, + Star icon if default |
| Description | flex-2 (min 200px) | Left | Text, color: secondary, truncate (tooltip on hover) |
| Type | 80px | Center | "Agent" badge or empty |
| In Use | 100px | Left | Client count (e.g., "47 clients") |
| Status | 80px | Center | Toggle switch |
| Actions | 60px | Center | MoreHorizontal icon menu (Edit, Set as Default, Delete) |

**Table Structure:**
```tsx
<div className="card">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="w-10 px-3 py-3"></th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Description
          </th>
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            In Use
          </th>
          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="w-16 px-3 py-3"></th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {/* ClientTypeRow components */}
      </tbody>
    </table>
  </div>
</div>
```

**CSS Variables:**
- Table header bg: `var(--color-gray-50)` / `#F9FAFB`
- Header text: `var(--text-xs)`, `var(--color-text-secondary)`
- Row hover: `var(--color-gray-50)`
- Divider: `var(--color-divider)` / `#F3F4F6`

### 5.4 Table Row Component

**Structure:**
```tsx
<tr
  className="hover:bg-gray-50 transition-colors"
  draggable
  onDragStart={handleDragStart}
  onDragOver={handleDragOver}
  onDrop={handleDrop}
>
  {/* Drag Handle */}
  <td className="px-3 py-4">
    <button
      className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
      aria-label="Drag to reorder"
    >
      <GripVertical size={20} />
    </button>
  </td>

  {/* Name + Default Star */}
  <td className="px-6 py-4">
    <div className="flex items-center gap-2">
      {clientType.is_default && (
        <Star size={16} className="text-amber-500 fill-amber-500" aria-label="Default type" />
      )}
      <span className="font-medium text-gray-900">{clientType.name}</span>
    </div>
  </td>

  {/* Description with tooltip */}
  <td className="px-6 py-4">
    <span
      className="text-gray-500 truncate max-w-xs block"
      title={clientType.description || ''}
    >
      {clientType.description || '—'}
    </span>
  </td>

  {/* Agent Badge */}
  <td className="px-4 py-4 text-center">
    {clientType.agent && (
      <span className="badge badge-info">Agent</span>
    )}
  </td>

  {/* Client Count */}
  <td className="px-4 py-4 text-left">
    <span className="text-gray-600 text-sm">
      {clientType.client_count.toLocaleString()} client{clientType.client_count !== 1 ? 's' : ''}
    </span>
  </td>

  {/* Status Toggle */}
  <td className="px-4 py-4 text-center">
    <Toggle
      checked={clientType.is_active}
      onChange={(checked) => handleToggleStatus(clientType.id, checked)}
      aria-label={`${clientType.is_active ? 'Deactivate' : 'Activate'} ${clientType.name}`}
      disabled={clientType.is_default && clientType.is_active} // Can't deactivate default
    />
  </td>

  {/* Actions Menu */}
  <td className="px-3 py-4">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 hover:bg-gray-100 rounded-md">
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleEdit(clientType)}>
          <Pencil size={16} className="mr-2" />
          Edit
        </DropdownMenuItem>
        {!clientType.is_default && (
          <DropdownMenuItem onClick={() => handleSetDefault(clientType)}>
            <Star size={16} className="mr-2" />
            Set as Default
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDelete(clientType)}
          className="text-red-600"
          disabled={clientType.is_default}
        >
          <Trash2 size={16} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </td>
</tr>
```

**Business Rules for Default Type:**
- Cannot deactivate the default type (toggle is disabled)
- Cannot delete the default type (option is disabled with tooltip explaining why)
- Setting a new default automatically removes default from previous type

### 5.5 Agent Badge

**CSS:**
```css
.badge-agent {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-info-800);
  background-color: color-mix(in srgb, var(--color-info-600) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--color-info-600) 25%, transparent);
  border-radius: var(--radius-full);
}
```

### 5.6 Status Toggle

**Specifications:**
- Width: 44px
- Height: 24px
- Track colors:
  - Active: `var(--color-success-600)` (#059669)
  - Inactive: `var(--color-gray-300)` (#D1D5DB)
- Thumb: White circle, 20px diameter
- Transition: 150ms ease

**Structure:**
```tsx
<button
  role="switch"
  aria-checked={checked}
  onClick={() => onChange(!checked)}
  className={cn(
    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
    checked ? "bg-success-600" : "bg-gray-300"
  )}
>
  <span
    className={cn(
      "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
      checked ? "translate-x-5" : "translate-x-1"
    )}
  />
</button>
```

### 5.7 Create/Edit Modal

**Modal Dimensions:**
- Desktop: 480px max-width, centered
- Mobile (< 640px): Full-screen or 95vw with small margins
- Padding: 24px (card-body standard)

**Form Fields:**

| Field | Type | Validation | Help Text |
|-------|------|------------|-----------|
| Name | Text input | Required, 1-100 chars | "Display name shown throughout the system" |
| Description | Textarea | Optional, max 500 chars | "Optional details about this client type" |
| Agent | Checkbox | None | "Enable if this represents a travel agent or reseller" |
| Active | Checkbox | None | "Inactive types won't appear in booking forms" |

**Structure:**
```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader onClose={onClose}>
    {editingType ? 'Edit Client Type' : 'Add Client Type'}
  </ModalHeader>
  
  <ModalBody>
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div className="form-group">
        <label className="form-label required">Name</label>
        <input
          type="text"
          className={cn("input", errors.name && "error")}
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="e.g., Corporate, VIP, Travel Agent"
          maxLength={100}
        />
        {errors.name && (
          <p className="form-error-text">
            <AlertCircle size={14} />
            {errors.name}
          </p>
        )}
        <p className="form-help-text">Display name shown throughout the system</p>
      </div>
      
      {/* Description Field */}
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="input min-h-[100px] resize-y"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Optional details about this client type..."
          maxLength={500}
        />
        <p className="form-help-text">
          {formData.description?.length || 0}/500 characters
        </p>
      </div>
      
      {/* Agent Checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="agent"
          checked={formData.agent}
          onChange={(e) => setFormData({...formData, agent: e.target.checked})}
          className="mt-1"
        />
        <div>
          <label htmlFor="agent" className="form-label cursor-pointer">
            Travel Agent / Reseller
          </label>
          <p className="form-help-text">
            Enable if this represents a travel agent or reseller account.
            Agents can make bookings on behalf of customers and may receive
            different pricing or commission rates.
          </p>
        </div>
      </div>
      
      {/* Active Checkbox */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
          className="mt-1"
        />
        <div>
          <label htmlFor="is_active" className="form-label cursor-pointer">
            Active
          </label>
          <p className="form-help-text">
            Inactive types won't appear in booking forms
          </p>
        </div>
      </div>
    </form>
  </ModalBody>
  
  <ModalFooter>
    <button type="button" className="btn-secondary" onClick={onClose}>
      Cancel
    </button>
    <button 
      type="submit" 
      className="btn-primary"
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <LoadingSpinner size="sm" className="mr-2" />
          Saving...
        </>
      ) : (
        editingType ? 'Save Changes' : 'Create Client Type'
      )}
    </button>
  </ModalFooter>
</Modal>
```

### 5.8 Delete Confirmation Modal

**Structure:**
```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  <ModalHeader onClose={onClose}>Delete Client Type</ModalHeader>

  <ModalBody>
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
        <AlertTriangle className="text-red-600" size={20} />
      </div>
      <div className="flex-1">
        <p className="text-gray-900 font-medium">
          Are you sure you want to delete "{clientType.name}"?
        </p>

        {/* Impact Warning - show client count */}
        {clientType.client_count > 0 && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 text-sm font-medium">
              <AlertTriangle size={16} className="inline mr-1" />
              This type is currently used by {clientType.client_count.toLocaleString()} client{clientType.client_count !== 1 ? 's' : ''}.
            </p>
            <p className="text-amber-700 text-sm mt-1">
              Deleting it will require reassigning all clients to a different type.
            </p>
          </div>
        )}

        {clientType.client_count === 0 && (
          <p className="text-gray-500 text-sm mt-2">
            This client type is not currently in use.
          </p>
        )}

        {/* Acknowledgment checkbox for types with clients */}
        {clientType.client_count > 0 && (
          <label className="flex items-start gap-2 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={acknowledgeImpact}
              onChange={(e) => setAcknowledgeImpact(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-600">
              I understand that all {clientType.client_count.toLocaleString()} client{clientType.client_count !== 1 ? 's' : ''} will need to be reassigned
            </span>
          </label>
        )}
      </div>
    </div>
  </ModalBody>

  <ModalFooter>
    <button type="button" className="btn-secondary" onClick={onClose}>
      Cancel
    </button>
    <button
      type="button"
      className="btn-primary bg-red-600 hover:bg-red-700"
      onClick={handleConfirmDelete}
      disabled={isDeleting || (clientType.client_count > 0 && !acknowledgeImpact)}
    >
      {isDeleting ? 'Deleting...' : 'Delete Client Type'}
    </button>
  </ModalFooter>
</Modal>
```

**Note**: The delete button is disabled until the user acknowledges the impact when there are clients using this type.

---

## 6. User Interactions and Flows

### 6.1 Create Client Type Flow

```
User clicks "Add Client Type" button
    ↓
Modal opens with empty form, focus on Name field
    ↓
User fills in required Name field
    ↓
User optionally fills Description
    ↓
User optionally checks "Agent" checkbox
    ↓
User clicks "Create Client Type"
    ↓
┌─────────────────────────────────────┐
│ Validation passes?                  │
├─────────────────────────────────────┤
│ YES → Submit to API                 │
│       → Show loading state          │
│       → On success: Close modal     │
│         Show success toast          │
│         Add row to table (animated) │
│       → On error: Show error toast  │
│         Keep modal open             │
├─────────────────────────────────────┤
│ NO  → Show inline validation errors │
│       Focus first error field       │
└─────────────────────────────────────┘
```

### 6.2 Edit Client Type Flow

```
User clicks row actions menu (•••) → "Edit"
    ↓
Modal opens with pre-filled form
    ↓
User makes changes
    ↓
User clicks "Save Changes"
    ↓
[Same validation/submission flow as Create]
    ↓
On success: Table row updates (animated highlight)
```

### 6.3 Toggle Active Status Flow

```
User clicks status toggle
    ↓
Optimistic UI update (toggle switches immediately)
    ↓
API request sent in background
    ↓
┌─────────────────────────────────────┐
│ API Success?                        │
├─────────────────────────────────────┤
│ YES → Show brief success toast      │
│       "Client type updated"         │
├─────────────────────────────────────┤
│ NO  → Revert toggle to previous     │
│       Show error toast              │
│       "Failed to update status"     │
└─────────────────────────────────────┘
```

### 6.4 Reorder Flow (Drag and Drop)

```
User grabs drag handle (cursor: grab)
    ↓
User drags row (cursor: grabbing)
    ↓
Visual feedback: 
  - Dragged row elevated with shadow
  - Drop target highlighted with border
  - Other rows shift to show insertion point
    ↓
User drops row in new position
    ↓
Optimistic UI update (rows reorder)
    ↓
API request to update sort_order values
    ↓
On error: Revert to original order, show error toast
```

### 6.5 Reorder Flow (Keyboard/Button Fallback)

For accessibility, provide alternative reordering:

```
User focuses row → presses keyboard shortcut or clicks reorder button
    ↓
Row enters "reorder mode"
    ↓
Up/Down arrows (or buttons) move row
    ↓
Enter confirms new position
    ↓
Escape cancels and reverts
```

### 6.6 Set as Default Flow

```
User clicks row actions menu (•••) → "Set as Default"
    ↓
Confirmation toast: "Set 'Corporate' as the default client type?"
    ↓
User confirms (or clicks the option directly without confirmation for simplicity)
    ↓
API request to update is_default flag
    ↓
┌─────────────────────────────────────┐
│ API Success?                        │
├─────────────────────────────────────┤
│ YES → Remove star from old default  │
│       Add star to new default       │
│       Show success toast:           │
│       "Corporate is now the default │
│       client type"                  │
├─────────────────────────────────────┤
│ NO  → Show error toast              │
│       "Failed to set default"       │
│       No UI changes                 │
└─────────────────────────────────────┘
```

### 6.7 Delete Flow

```
User clicks row actions menu (•••) → "Delete"
    ↓
Confirmation modal opens
    ↓
User clicks "Delete Client Type"
    ↓
API request sent
    ↓
┌─────────────────────────────────────┐
│ API Success?                        │
├─────────────────────────────────────┤
│ YES → Close modal                   │
│       Remove row (animated fade-out)│
│       Show success toast            │
│       "Client type deleted"         │
├─────────────────────────────────────┤
│ NO  → Show error in modal           │
│       Keep modal open               │
│       Common: "Cannot delete type   │
│       with existing clients"        │
└─────────────────────────────────────┘
```

### 6.8 Search and Filter Flow

```
User types in search field
    ↓
Debounce: 300ms
    ↓
Filter table rows client-side (name and description match)
    ↓
Update "Showing X of Y client types" text
    ↓
If no matches: Show empty search state
    ↓
User changes status filter dropdown
    ↓
Immediately filter by active/inactive status
    ↓
Combined with search if active
```

---

## 7. State Management

### 7.1 Application States

#### Loading State (Initial)

Display while fetching client types:

```tsx
<div className="card">
  <div className="card-body">
    {/* Skeleton rows */}
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-48 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse" />
      </div>
    ))}
  </div>
</div>
```

#### Empty State (No Client Types)

```tsx
<div className="card">
  <div className="card-body">
    <EmptyState
      icon={<Users size={48} />}
      title="No client types yet"
      description="Client types help you categorize customers and apply different pricing or policies. Create your first client type to get started."
      actions={
        <button className="btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={20} className="mr-2" />
          Add Client Type
        </button>
      }
    />
  </div>
</div>
```

#### Empty Search State

```tsx
<div className="card">
  <div className="card-body">
    <EmptyState
      icon={<Search size={48} />}
      title="No matching client types"
      description={`No client types match "${searchQuery}". Try a different search term.`}
      actions={
        <button className="btn-secondary" onClick={() => setSearchQuery('')}>
          Clear Search
        </button>
      }
    />
  </div>
</div>
```

#### Error State (Failed to Load)

```tsx
<div className="card">
  <div className="card-body">
    <EmptyState
      icon={<AlertTriangle size={48} className="text-red-500" />}
      title="Failed to load client types"
      description="We couldn't load your client types. Please check your connection and try again."
      actions={
        <button className="btn-primary" onClick={() => refetch()}>
          <RefreshCw size={20} className="mr-2" />
          Try Again
        </button>
      }
    />
  </div>
</div>
```

### 7.2 Row States

| State | Visual Treatment |
|-------|------------------|
| Default | Standard styling |
| Hover | `bg-gray-50` background |
| Dragging | Elevated shadow, slight opacity reduction on original position |
| Drop Target | Blue left border, subtle background tint |
| Just Created | Brief green highlight animation (1.5s fade) |
| Just Updated | Brief yellow highlight animation (1.5s fade) |
| Inactive | Row text color reduced to secondary gray |

### 7.3 Form States

| State | Button Text | Behavior |
|-------|-------------|----------|
| Clean (no changes) | "Create Client Type" / "Save Changes" | Enabled |
| Valid (with changes) | Same | Enabled |
| Invalid | Same | Enabled but shows errors on submit |
| Submitting | "Creating..." / "Saving..." | Disabled with spinner |
| Error | Same | Enabled, error message shown |

---

## 8. Responsive Design

### Breakpoints

| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
| Mobile | < 640px | Stack layout, card-based list view |
| Tablet | 640px - 1023px | Table view, narrower columns |
| Desktop | 1024px+ | Full table view |

### Mobile Adaptations

1. **List View Instead of Table**
   - Each client type becomes a card
   - Name prominent at top
   - Description below (truncated to 2 lines)
   - Agent badge inline with name
   - Toggle switch at right
   - Tap card to expand/edit

2. **Simplified Header**
   - "Add" button shows icon only (or FAB)
   - Title and description stack vertically

3. **Touch-Friendly Interactions**
   - Larger touch targets (44px minimum)
   - Swipe gestures for quick actions (optional)
   - Bottom sheet for actions menu instead of dropdown

4. **Reordering (Mobile-Optimized)**
   - Instead of drag-and-drop on mobile, use "Edit Order" button
   - Entering edit mode shows up/down arrow buttons on each row
   - Tap up/down to reorder (more reliable on touch, works in harsh environments)
   - "Done" button saves changes and exits edit mode
   - This is more touch-friendly than drag-and-drop for operators on boats, in bright sunlight, or wearing gloves

### Container Query Approach

Since this app is embedded, use container queries for responsive behavior:

```css
.client-types-container {
  container-type: inline-size;
  container-name: client-types;
}

@container client-types (max-width: 640px) {
  .client-types-table {
    display: none;
  }
  .client-types-list {
    display: block;
  }
}

@container client-types (min-width: 641px) {
  .client-types-table {
    display: table;
  }
  .client-types-list {
    display: none;
  }
}
```

---

## 9. Accessibility Requirements

### Keyboard Navigation

| Key | Action |
|-----|--------|
| Tab | Move between interactive elements |
| Enter/Space | Activate buttons, toggles, checkboxes |
| Escape | Close modals, cancel drag |
| Arrow Up/Down | Navigate table rows when focused; reorder in edit mode |

### Screen Reader Considerations

1. **Table Structure**
   - Use proper `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` elements
   - Include `scope="col"` on header cells
   - Provide `aria-label` for icon-only buttons

2. **Status Announcements**
   - Use `aria-live="polite"` regions for:
     - Success/error toasts
     - Row count updates
     - Reorder confirmations

3. **Toggle Switches**
   - Use `role="switch"` with `aria-checked`
   - Provide descriptive `aria-label`: "Activate Individual client type"

4. **Drag and Drop**
   - Provide keyboard alternative (documented above)
   - Announce drag start/end: "Dragging Corporate. Use arrow keys to reorder."

### Focus Management

1. **Modal Opening**
   - Focus first interactive element (Name input for create, close button for delete)
   
2. **Modal Closing**
   - Return focus to trigger element (Add button or row actions)

3. **After Actions**
   - After create: Focus new row
   - After delete: Focus next row or previous if last

### Color Contrast

All text meets WCAG AA (4.5:1 ratio):
- Primary text (#111827) on white: 16.1:1
- Secondary text (#6B7280) on white: 5.4:1
- Error text (#DC2626) on white: 5.9:1
- Toggle active (green on white): 3.9:1 (enhanced by icon/position)

---

## 10. Implementation Notes

### 10.1 Recommended File Structure

```
src/
├── pages/
│   └── ClientTypesPage.tsx        # Main page component
├── components/
│   └── client-types/
│       ├── ClientTypesTable.tsx   # Table/list view
│       ├── ClientTypeRow.tsx      # Individual row component
│       ├── ClientTypeForm.tsx     # Create/edit form
│       ├── ClientTypeModal.tsx    # Modal wrapper for form
│       ├── DeleteConfirmModal.tsx # Delete confirmation
│       └── EmptyState.tsx         # Empty/error states
├── hooks/
│   └── useClientTypes.ts          # Data fetching and mutations
└── types/
    └── clientType.ts              # TypeScript interfaces
```

### 10.2 GraphQL Schema

```graphql
# Query - Get all client types with client counts
# Note: client_count may need to be fetched via aggregate or computed field
query GetClientTypes {
  jsg_reference_schema_client_types(order_by: {sort_order: asc}) {
    id
    name
    description
    agent
    is_active
    is_default
    sort_order
    created_at
    updated_at
    # Client count via aggregate relationship (if available)
    clients_aggregate {
      aggregate {
        count
      }
    }
  }
}

# Create Mutation
mutation CreateClientType($object: jsg_reference_schema_client_types_insert_input!) {
  insert_jsg_reference_schema_client_types_one(object: $object) {
    id
    name
    description
    agent
    is_active
    is_default
    sort_order
    created_at
    updated_at
  }
}

# Update Mutation
mutation UpdateClientType($id: uuid!, $set: jsg_reference_schema_client_types_set_input!) {
  update_jsg_reference_schema_client_types_by_pk(pk_columns: {id: $id}, _set: $set) {
    id
    name
    description
    agent
    is_active
    is_default
    sort_order
    updated_at
  }
}

# Set Default - clears old default first, then sets new
# This may need to be a transaction or handled via a custom mutation
mutation SetDefaultClientType($newDefaultId: uuid!, $oldDefaultId: uuid!) {
  # Clear old default
  update_old: update_jsg_reference_schema_client_types_by_pk(
    pk_columns: {id: $oldDefaultId},
    _set: {is_default: false}
  ) {
    id
    is_default
  }
  # Set new default
  update_new: update_jsg_reference_schema_client_types_by_pk(
    pk_columns: {id: $newDefaultId},
    _set: {is_default: true}
  ) {
    id
    is_default
  }
}

# Delete Mutation
mutation DeleteClientType($id: uuid!) {
  delete_jsg_reference_schema_client_types_by_pk(id: $id) {
    id
  }
}

# Bulk Update Sort Order
mutation UpdateClientTypeSortOrder($updates: [jsg_reference_schema_client_types_updates!]!) {
  update_jsg_reference_schema_client_types_many(updates: $updates) {
    affected_rows
  }
}
```

**Note on is_default field**: If the `is_default` field doesn't exist in the database schema, it can be implemented as:
1. A boolean column on the `client_types` table (preferred)
2. A separate settings table with a `default_client_type_id` reference
3. A computed field based on a tenant settings table

**Note on client_count**: The client count can be obtained via:
1. An aggregate relationship if `clients` has a `client_type_id` foreign key
2. A computed field that counts clients
3. A separate query to fetch counts (less efficient but simpler)

### 10.3 Key Dependencies

- `@dnd-kit/core` and `@dnd-kit/sortable` - Drag and drop functionality
- `lucide-react` - Icons (GripVertical, Plus, Pencil, Trash2, MoreHorizontal, etc.)
- `framer-motion` - Animations for row transitions
- React Query or similar - Data fetching and caching

### 10.4 Animation Specifications

**Row Animations (Framer Motion):**

```tsx
// New row entering
initial={{ opacity: 0, y: -10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}

// Row being deleted
exit={{ opacity: 0, x: -20 }}
transition={{ duration: 0.2 }}

// Highlight after update
animate={{ 
  backgroundColor: ['rgba(34, 197, 94, 0.2)', 'rgba(255, 255, 255, 1)'] 
}}
transition={{ duration: 1.5 }}
```

**Toggle Animation:**

```css
.toggle-thumb {
  transition: transform 150ms ease;
}
.toggle-track {
  transition: background-color 150ms ease;
}
```

### 10.5 Performance Considerations

1. **Optimistic Updates**
   - Toggle status changes should update UI immediately
   - Revert on API failure

2. **Debounced Search**
   - 300ms debounce on search input
   - Client-side filtering (data set is small)

3. **Virtualization**
   - Not needed for typical use case (< 20 client types)
   - Consider if operators have 50+ types

4. **Mutation Batching**
   - Batch sort order updates after drag-drop
   - Single API call for all affected rows

---

## Appendix A: CSS Variables Reference

Key CSS variables used in this design (from JetSetGo Design System):

```css
/* Colors */
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-success-600: #059669;
--color-error-600: #dc2626;
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-300: #d1d5db;
--color-gray-500: #6b7280;
--color-gray-900: #111827;
--color-text: #111827;
--color-text-secondary: #6b7280;
--color-border: #e5e7eb;
--color-divider: #f3f4f6;
--color-background: #ffffff;

/* Typography */
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-2xl: 1.5rem;
--font-weight-medium: 500;
--font-weight-bold: 700;

/* Spacing */
--spacing-1: 0.25rem;
--spacing-2: 0.5rem;
--spacing-3: 0.75rem;
--spacing-4: 1rem;
--spacing-6: 1.5rem;

/* Component Sizes */
--height-button: 52px;
--height-input: 40px;
--radius-md: 0.375rem;
--radius-lg: 0.5rem;
--radius-full: 9999px;

/* Focus */
--focus-borderColor: #3b82f6;
--focus-ringWidth: 2px;
--focus-ringOffset: 2px;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Transitions */
--transition-fast: all 150ms ease;
```

---

## Appendix B: Checklist for Implementation

### Core Functionality
- [ ] Page layout matches specification
- [ ] All form validations implemented
- [ ] Loading skeleton matches final layout
- [ ] Empty state displays correctly
- [ ] Error state with retry functionality

### CRUD Operations
- [ ] Create modal with all fields
- [ ] Edit modal pre-populates data
- [ ] Delete confirmation modal with impact warning
- [ ] Delete shows client count and requires acknowledgment if > 0
- [ ] Status toggle with optimistic updates
- [ ] Cannot deactivate/delete default type

### Default Type Feature
- [ ] Default star indicator on default type
- [ ] "Set as Default" action in menu
- [ ] Only one type can be default at a time
- [ ] Default type cannot be deactivated
- [ ] Default type cannot be deleted

### Client Count Display
- [ ] Client count column shows usage for each type
- [ ] Count formatted with thousands separator
- [ ] Delete modal shows impact warning with count

### Reordering
- [ ] Drag-and-drop reordering (desktop)
- [ ] Keyboard reordering alternative
- [ ] Mobile: "Edit Order" mode with up/down buttons
- [ ] Help text explaining sort order affects booking form dropdowns

### Search & Filter
- [ ] Search always visible (not hidden below threshold)
- [ ] Search filters by name and description
- [ ] Status filter (All/Active/Inactive)
- [ ] Empty search results state

### Feedback & Polish
- [ ] Success toasts for all actions
- [ ] Error toasts with retry
- [ ] Animations for row changes
- [ ] Highlight row after update

### Responsive Design
- [ ] Mobile responsive layout (card-based)
- [ ] Toggle accessible on mobile card view
- [ ] Mobile modal is full-screen/near full-screen
- [ ] All touch targets 44px minimum

### Accessibility
- [ ] Keyboard navigation complete
- [ ] Screen reader announcements
- [ ] Focus management on modal open/close
- [ ] Color contrast meets WCAG AA
- [ ] Proper ARIA labels on all interactive elements

### Permission Guards (if applicable)
- [ ] Check user permissions before showing edit/delete options
- [ ] Graceful handling when permissions are denied

---

**Document End**

*This specification provides a complete blueprint for implementing the Client Types Management interface. Developers should reference this document alongside the JetSetGo Style Guide and Design System Usage Rules for implementation details.*

*Version 1.1 incorporates feedback from transport/tourism industry UX review.*
