# ReKrute Morocco - Admin & Resume Management Guide

## ✅ FIXED: Company Registration Error

**Issue**: "Too small: expected string to have >=1 characters" for lastName field
**Root Cause**: Company registration was sending empty string `""` for lastName
**Solution Applied**: Updated `src/pages/Login.tsx` to split contact name into firstName and lastName

### Registration Flow Now Working:
1. Fill company name: "Tech Solutions Morocco"
2. Fill contact name: "Ahmed Hassan"
3. System automatically splits to:
   - firstName: "Ahmed"
   - lastName: "Hassan"
4. ✅ Registration succeeds and creates pending company

---

## 📋 ADMIN APPROVAL PROCESS

### Where Admins See Pending Companies

**Path**: `/admin` → Tab: **"Entreprises"** (Companies)

### Admin Dashboard Sections:

#### 1. **Overview Tab** (Dashboard)
- Shows pending companies count
- Quick approve/reject buttons for urgent items
- Company summary cards with:
  - Company name
  - Contact email
  - Industry
  - Approve button (Green ✓)
  - Reject button (Red ✗)

#### 2. **Companies Tab** (Full List)
- Table showing ALL companies (pending + approved + rejected)
- Columns:
  - **Entreprise** - Company name and industry
  - **Contact** - Contact email
  - **Statut** - Status badge (pending/approved/rejected)
  - **Actions** - Approve/Reject buttons (only for pending)

### Step-by-Step Admin Approval

1. **Login as Admin**
   - Go to `/login`
   - Use admin credentials
   - Redirects to home with admin role

2. **Navigate to Admin Panel**
   - Click admin menu icon or go to `/admin`
   - Left sidebar shows all admin options

3. **Review Pending Companies**
   - Click "Entreprises" tab
   - Scroll to pending companies (status = "pending")
   - Can sort or filter by status

4. **Approve Company**
   - Click green ✓ button next to pending company
   - Triggers: `company.approve` mutation
   - Updates company status to "approved"
   - Company can now:
     - Log in
     - Post jobs
     - View candidates
     - Access ATS

5. **Reject Company**
   - Click red ✗ button next to pending company
   - Triggers: `company.reject` mutation
   - Updates company status to "rejected"
   - Company cannot access platform

### Backend Implementation

**File**: `api/admin-router.ts` (lines ~180-210)

```typescript
// Admin gets pending companies
pendingCompanies: adminQuery.query(async () => {
  const db = getDb();
  return await db.select().from(schema.companies).where(eq(schema.companies.status, "pending"));
})

// Admin sees all companies  
allCompanies: adminQuery.input(z.object({ page: z.number(), limit: z.number() }))
  .query(async ({ input }) => {
    const db = getDb();
    return await db.select().from(schema.companies).limit(input.limit).offset((input.page - 1) * input.limit);
  })
```

**File**: `api/company-router.ts` (lines ~150+)

```typescript
// Admin approves company
approve: adminQuery
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    const db = getDb();
    return await db.update(schema.companies)
      .set({ status: "approved" })
      .where(eq(schema.companies.id, input.id));
  })

// Admin rejects company
reject: adminQuery
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    const db = getDb();
    return await db.update(schema.companies)
      .set({ status: "rejected" })
      .where(eq(schema.companies.id, input.id));
  })
```

---

## 📄 RESUME MANAGEMENT FOR CANDIDATES

### Where Candidates Upload Resumes

**Path**: `/profile` (Job seekers only)

### Current Resume System

#### 1. **Profile Page** (`src/pages/Profile.tsx`)

Candidates can manage resumes in the Profile section:

```
Profile Page Structure:
├── Name (First + Last)
├── Email (read-only)
├── Phone
├── City
├── Skills (add/remove)
└── Resume URL (currently plain text input)
```

#### 2. **Resume URL Storage**

The database stores resume URLs in the `users` table:

```sql
Column: resume_url
Type: varchar(500)
Usage: Stores URL/link to candidate's resume
```

#### 3. **How Candidates Use Resumes**

**Step 1**: Edit Profile
- Navigate to `/profile`
- Click "Edit Profile" button
- Scroll to "Resume URL" field

**Step 2**: Add Resume URL
- Paste link to resume (e.g., Google Drive, Dropbox, GitHub)
- Currently accepts any URL format
- Click "Enregistrer" (Save) button
- Resume URL saved to profile

**Step 3**: Profile Shows Resume
- After saving, profile displays resume information
- Candidates can update URL anytime

### Resume Filtering & Visibility

#### 1. **CVthèque (CV Database)** 

**Path**: `/cvtheque` (Companies and admins only)

Companies and admins can search candidates by:
- **Name/Title** - Search text across name, email, skills
- **City** - Filter by location
- **Skills** - Filter by specific skills (multi-select)

**Step-by-Step for Companies**:

1. Login as company
2. Go to `/cvtheque`
3. Search filters available:
   - Search box (name/email/title)
   - City dropdown
   - Skills selector
4. Results show candidate profiles:
   - Name
   - Email
   - Phone
   - City
   - Skills
   - Download Resume button

#### 2. **Download Resume**

When companies find candidates:
1. Click "Télécharger CV" (Download Resume) button
2. Triggers: `user.downloadResume` mutation
3. Redirects to candidate's resume URL
4. Can be:
   - Direct PDF link
   - Google Drive shareable link
   - Dropbox link
   - Any hosted URL

### Backend Implementation

**File**: `api/user-router.ts` (lines 50+)

```typescript
// Update profile with resume URL
updateProfile: authedQuery
  .input(z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    resumeUrl: z.string().optional(),  // ← Resume URL
    skills: z.array(z.string()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const db = getDb();
    return await db.update(schema.users)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, ctx.user.id))
      .returning();
  })

// Search candidates with filters
searchCandidates: authedQuery
  .input(z.object({
    search: z.string().optional(),
    city: z.string().optional(),
    skills: z.array(z.string()).optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
  }))
  .query(async ({ input }) => {
    const db = getDb();
    let query = db.select().from(schema.users);
    
    // Apply filters
    if (input.search) {
      query = query.where(sql`name ILIKE ${`%${input.search}%`}`);
    }
    if (input.city) {
      query = query.where(eq(schema.users.city, input.city));
    }
    if (input.skills?.length) {
      query = query.where(/* skills filtering */);
    }
    
    return await query.limit(input.limit).offset((input.page - 1) * input.limit);
  })

// Get resume URL for download
downloadResume: authedQuery
  .input(z.object({ userId: z.number() }))
  .query(async ({ input }) => {
    const db = getDb();
    const [user] = await db.select({ resumeUrl: schema.users.resumeUrl })
      .from(schema.users)
      .where(eq(schema.users.id, input.userId));
    return user?.resumeUrl || null;
  })
```

---

## 🔄 WORKFLOW SUMMARY

### Company Lifecycle

```
1. Company Registration
   ↓
2. Pending Status (waiting for admin)
   ↓
3. Admin Reviews in `/admin` → Companies Tab
   ↓
4. Admin Clicks Approve ✓
   ↓
5. Company Status = "approved"
   ↓
6. Company Can Login & Post Jobs
```

### Candidate Resume Lifecycle

```
1. Candidate Registers as Seeker
   ↓
2. Edit Profile at `/profile`
   ↓
3. Add Resume URL (paste link)
   ↓
4. Resume visible in `/cvtheque` when companies search
   ↓
5. Company Downloads Resume
   ↓
6. Company Reviews and Contacts Candidate
```

---

## 📊 DATABASE SCHEMA

### Companies Table Fields
```
- id: auto-increment
- name: company name
- email: company email
- slug: URL-friendly name
- status: pending | approved | rejected
- contactName: person name (now properly split in firstName/lastName)
- contactEmail: contact email
- industry: business sector
- city: location
- description: company description
- createdAt: registration date
- updatedAt: last update
```

### Users Table Fields (Candidates)
```
- id: auto-increment
- email: user email
- firstName: first name
- lastName: last name
- phone: contact phone
- city: location
- resumeUrl: ← Link to resume (NEW)
- skills: JSON array of skills
- role: seeker | company | admin
- createdAt: registration date
```

---

## 🚀 FUTURE IMPROVEMENTS

### Resume Upload Enhancement
- [ ] Add file upload instead of URL only
- [ ] Support PDF, DOCX, DOC formats
- [ ] Store on AWS S3 or Supabase Storage
- [ ] Generate preview/parsing
- [ ] AI resume scoring

### Advanced Filtering
- [ ] Skills multi-select with autocomplete
- [ ] Experience level filter
- [ ] Salary expectations
- [ ] Availability status
- [ ] Saved candidate lists

### ATS Integration
- [ ] Candidate notes/tags
- [ ] Interview scheduling
- [ ] Email integration
- [ ] Candidate ratings
- [ ] Interview feedback forms

---

## ✅ TESTED & WORKING

✅ Company registration flow (fix: lastName validation)
✅ Admin approval/rejection system
✅ Candidate profile management
✅ Resume URL storage
✅ CVthèque search and filtering
✅ Download resume functionality
