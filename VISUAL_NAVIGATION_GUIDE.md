# ReKrute Morocco - Visual Navigation Guide

## 🗺️ WHERE TO FIND EVERYTHING

### Company Registration (FIXED ✅)

**Path**: `http://localhost:3001/login`

```
Login Page
├── Three Tab Buttons:
│   ├── "Connexion" (Login)
│   ├── "Candidat" (Candidate Register)
│   └── "Entreprise" (Company Register) ← Click here
│
└── Company Registration Form:
    ├── Nom de l'entreprise (Company Name)
    ├── Email professionnel (Professional Email)
    ├── Mot de passe (Password - min 6 chars)
    ├── Nom du contact (Contact Name) ← Fixed! Now handles "Ahmed Hassan"
    ├── Secteur (Industry)
    ├── Ville (City)
    ├── Description (Company Description)
    └── "Demander la vérification" (Request Verification Button)
```

**Result After Registration**:
- ✅ Success: Account created
- ✅ Status: "Waiting for approval" message
- ✅ Email saved for admin review
- ✅ Account in "pending" status in database

---

## 👨‍💼 ADMIN COMPANY APPROVAL

**Path**: `http://localhost:3001/admin`

### Step 1: Access Admin Panel

```
Navigation (Top Right):
├── Click User Menu Icon
├── Select "Admin Panel" or
└── Go directly to /admin
```

### Step 2: Navigate to Companies Tab

```
Left Sidebar Menu:
├── Dashboard (Overview)
├── Entreprises ← Click here to see all companies
├── Offres
├── Candidatures
├── Utilisateurs
├── Flux RSS
└── Paramètres

Current Tab shows: "Entreprises" (Companies)
```

### Step 3: View Pending Companies

```
Companies Table:
┌─────────────────────────────────────────────────────┐
│ Entreprise | Contact | Statut | Actions             │
├─────────────────────────────────────────────────────┤
│ Tech      │ contact@│pending │ [✓ Approve] [✗ Rej] │
│ Solutions │ tech.ma │        │                      │
├─────────────────────────────────────────────────────┤
│ WebDev    │ info@   │pending │ [✓ Approve] [✗ Rej] │
│ Agency    │ web.ma  │        │                      │
├─────────────────────────────────────────────────────┤
│ Design Co │ hr@     │pending │ [✓ Approve] [✗ Rej] │
│           │ design. │        │                      │
│           │ ma      │        │                      │
└─────────────────────────────────────────────────────┘
```

### Step 4: Approve/Reject Company

```
Option A: Approve Company ✅
├── Find company with "pending" status
├── Click green ✓ button in Actions column
└── Status changes to "approved" (instant)

Option B: Reject Company ❌
├── Find company with "pending" status
├── Click red ✗ button in Actions column
└── Status changes to "rejected" (instant)
```

### Alternative: Quick Approval from Overview

```
Admin Dashboard → Overview Tab:
├── Shows pending companies as cards
├── Each card shows:
│   ├── Company name
│   ├── Contact email
│   ├── Industry
│   ├── Approve button (green)
│   └── Reject button (red)
└── Can approve directly from here
```

---

## 📄 CANDIDATE RESUME MANAGEMENT

### Location 1: Profile Page

**Path**: `http://localhost:3001/profile`

```
Profile Page (for Job Seekers):
├── Tab: "Profil" (View Mode)
│   └── Shows all profile information read-only
│
├── Tab: "Modifier" (Edit Mode) ← Click here to edit
│   ├── First Name field
│   ├── Last Name field
│   ├── Email (read-only)
│   ├── Phone Number field
│   ├── City field
│   ├── Resume Link field ← NEW! Paste CV URL here
│   │   └── Placeholder: "https://example.com/your-resume.pdf"
│   │   └── Accepted: Google Drive, Dropbox, personal site, etc.
│   ├── Skills section
│   │   ├── Text input: "Add skill"
│   │   ├── Plus button to add skill
│   │   └── List of skills with X button to remove
│   └── "Enregistrer" (Save) button
```

### Step-by-Step: Add Resume to Profile

```
1. Login as job seeker
   └── Navigate to /profile

2. Click "Modifier" button
   └── Form becomes editable

3. Scroll to "Lien vers votre CV"
   └── Paste your resume URL
   
4. Options for Resume URL:
   ├── Google Drive:
   │   └── https://drive.google.com/file/d/FILE_ID/view
   ├── Dropbox:
   │   └── https://www.dropbox.com/s/CODE/resume.pdf
   ├── Personal website:
   │   └── https://yoursite.com/resume.pdf
   └── GitHub portfolio:
       └── https://github.com/username/portfolio

5. Add skills if needed:
   ├── Type skill name: "JavaScript", "React", "Python"
   ├── Press Enter or click Plus button
   ├── Skill appears as blue tag
   └── Click X to remove skill

6. Click "Enregistrer" button
   └── Profile saved with resume link

7. Success message appears
   └── Resume now visible on profile
```

### Location 2: CVthèque (Candidate Database)

**Path**: `http://localhost:3001/cvtheque`

**Access**: Companies and Admins only

```
CVthèque Search Interface:
├── Search Filters (Top):
│   ├── Search Box: "Search by name, email, skills..."
│   ├── City Dropdown: "Select city..."
│   └── Skills Multi-Select: "Select skills..."
│
├── Search Button: "Search"
│
└── Results Grid:
    ├── Each Candidate Card shows:
    │   ├── Name
    │   ├── Email
    │   ├── Phone
    │   ├── City
    │   ├── Skills (as tags)
    │   └── "Télécharger CV" (Download Resume) button
    │
    └── Pagination:
        ├── Previous / Next buttons
        └── Shows current page (1, 2, 3...)
```

### Step-by-Step: Find & Download Resume

```
1. Login as company or admin
   └── Navigate to /cvtheque

2. Use Search Filters:

   Option A: Search by name/email
   ├── Type in search box: "Ahmed Hassan"
   ├── System searches name, email, job title
   └── Results update in real-time

   Option B: Filter by city
   ├── Click city dropdown
   ├── Select: Casablanca, Fes, Marrakech, Rabat, etc.
   └── Shows only candidates in that city

   Option C: Filter by skills
   ├── Click skills selector
   ├── Check: "JavaScript", "React", "Python", etc.
   ├── Select multiple skills
   └── Shows candidates with those skills

3. Click "Search" button (if not real-time)
   └── Results filtered

4. Review candidate cards:
   ├── See name, contact info, location
   ├── Check skills listed
   └── Read candidate summary

5. Click "Télécharger CV" button
   └── Opens candidate's resume in new tab
   └── Can review and assess fit

6. Contact Candidate (if interested):
   ├── Note the email/phone
   ├── Send job offer
   └── Schedule interview
```

---

## 🔄 COMPLETE WORKFLOW EXAMPLES

### Example 1: Company Registration & Approval

```
DAY 1 - Company Registers:
├── Go to /login
├── Click "Entreprise"
├── Fill form:
│   ├── Company Name: "Tech Solutions Morocco"
│   ├── Email: "contact@techsolutions.ma"
│   ├── Password: "password123"
│   ├── Contact Name: "Ahmed Hassan"  ← Properly handled now!
│   ├── Industry: "Information Technology"
│   ├── City: "Casablanca"
│   └── Description: "Leading software development company"
├── Click "Demander la vérification"
└── Success! Account created (pending approval)

DAY 2 - Admin Reviews & Approves:
├── Login as admin
├── Go to /admin
├── Click "Entreprises" tab
├── Find "Tech Solutions Morocco" with status "pending"
├── Click green ✓ button
└── Status changes to "approved" immediately!

DAY 3 - Company Can Now Work:
├── Company logs in
├── Can access dashboard
├── Can post job listings
├── Can view applications
├── Can search candidates in CVthèque
└── Full platform access granted
```

### Example 2: Candidate Profile & Resume Sharing

```
DAY 1 - Candidate Registers:
├── Go to /login
├── Click "Candidat"
├── Register with:
│   ├── First Name: "John"
│   ├── Last Name: "Smith"
│   ├── Email: "john@email.com"
│   └── Password: "password123"
└── Redirected to /dashboard

DAY 2 - Candidate Uploads Resume:
├── Go to /profile
├── Click "Modifier" (Edit)
├── Scroll to "Lien vers votre CV"
├── Paste resume URL from Google Drive
│   └── https://drive.google.com/file/d/1234567890/view
├── Add skills: ["JavaScript", "React", "Node.js"]
├── Click "Enregistrer"
└── Success! Resume saved to profile

DAY 5 - Company Finds Candidate:
├── Company goes to /cvtheque
├── Searches: "JavaScript React"
├── Sees "John Smith" in results with:
│   ├── Name: John Smith
│   ├── Email: john@email.com
│   ├── Phone: +212612345678
│   ├── City: Casablanca
│   ├── Skills: [JavaScript, React, Node.js]
│   └── Button: "Télécharger CV"
├── Clicks "Télécharger CV"
└── Opens John's resume on Google Drive

DAY 6 - Company Contacts Candidate:
├── Reviews John's resume
├── Sees experience matches requirements
├── Sends email: "john@email.com"
├── Offers interview
└── John responds to interview invitation
```

---

## 📱 SCREEN LAYOUT REFERENCE

### Company Registration Screen
```
┌────────────────────────────────────────────────┐
│  ReKrute.                          [Menu]      │
├────────────────────────────────────────────────┤
│                                                │
│  Left Side: (Hidden)                           │
│  - Gradient background                         │
│  - Brand info                                  │
│                                                │
│  Right Side: (50% width)                       │
│  ┌──────────────────────────────────────────┐  │
│  │  [Connexion] [Candidat] [Entreprise] ✓  │  │
│  │                                           │  │
│  │  Inscription Entreprise                  │  │
│  │  "Publiez vos offres et recrutez..."     │  │
│  │  "Votre compte sera examiné..."          │  │
│  │                                           │  │
│  │  [Nom de l'entreprise    ▼ ]            │  │
│  │  [Email professionnel    ▼ ]            │  │
│  │  [Mot de passe          ▼ ]            │  │
│  │  [Nom du contact        ▼ ]            │  │
│  │  [Secteur ▼] [Ville ▼]                 │  │
│  │  [Description                      ]    │  │
│  │                                           │  │
│  │     [Demander la vérification]          │  │
│  └──────────────────────────────────────────┘  │
│                                                │
└────────────────────────────────────────────────┘
```

### Admin Companies Tab
```
┌────────────────────────────────────────────────┐
│  ReKrute.    [Admin Menu] [Settings] [Logout]  │
├────────────────────────────────────────────────┤
│ ┌──────────────┐                               │
│ │ Sidebar Menu │     Main Content              │
│ ├──────────────┤                               │
│ │ Dashboard    │  ┌────────────────────────┐  │
│ │ Entreprises ✓│  │ Entreprises            │  │
│ │ Offres       │  │ [Search] [Filter]      │  │
│ │ Candidatures │  │                        │  │
│ │ Utilisateurs │  │ ┌──────────────────┐  │  │
│ │ Flux RSS     │  │ │ Name │ Contact  │  │  │
│ │ Paramètres   │  │ ├──────────────────┤  │  │
│ └──────────────┘  │ │ Tech │ contact@ │  │  │
│                   │ │Sol.. │ tech.ma  │  │  │
│                   │ │      │ Status:  │  │  │
│                   │ │      │ pending  │  │  │
│                   │ │      │          │  │  │
│                   │ │ [✓] [✗]      │  │  │
│                   │ └──────────────────┘  │  │
│                   │                        │  │
│                   │ Pagination: < 1 >      │  │
│                   └────────────────────────┘  │
└────────────────────────────────────────────────┘
```

### Candidate Profile Screen
```
┌────────────────────────────────────────────────┐
│  ReKrute.    [Profile ▼]         [Logout]      │
├────────────────────────────────────────────────┤
│                                                │
│     [View Profile] [Edit Profile] ✓            │
│                                                │
│     EDIT MODE:                                 │
│     ┌────────────────────────────────────────┐ │
│     │ Prénom: [John        ▼]                │ │
│     │ Nom: [Smith          ▼]                │ │
│     │ Email: john@email.com (locked)         │ │
│     │ Téléphone: [+212612345678 ▼]          │ │
│     │ Ville: [Casablanca   ▼]               │ │
│     │ CV Link: [https://...resume.pdf  ▼]  │ │
│     │ "Collez le lien de votre CV..."       │ │
│     │                                        │ │
│     │ Compétences:                           │ │
│     │ [JavaScript ▼] [Add]                  │ │
│     │ [JavaScript] [React] [Node.js]       │ │
│     │                                        │ │
│     │    [Enregistrer] [Annuler]            │ │
│     └────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

### CVthèque Search Screen
```
┌────────────────────────────────────────────────┐
│  ReKrute.    [Profile ▼]         [Logout]      │
├────────────────────────────────────────────────┤
│                                                │
│  CVthèque - Search Candidates                 │
│  ┌────────────────────────────────────────┐   │
│  │ [Search...] [City ▼] [Skills ▼]     │   │
│  │                      [Search]        │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  Results: 5 candidates found                  │
│  ┌────────────────────────────────────────┐   │
│  │ ┌──────────────────────────────────┐  │   │
│  │ │ John Smith                       │  │   │
│  │ │ john@email.com                   │  │   │
│  │ │ +212612345678 | Casablanca       │  │   │
│  │ │ Skills: JavaScript, React, ...   │  │   │
│  │ │ [Télécharger CV] [Contact]       │  │   │
│  │ └──────────────────────────────────┘  │   │
│  │                                        │   │
│  │ ┌──────────────────────────────────┐  │   │
│  │ │ Sarah Mohamed                    │  │   │
│  │ │ sarah@email.com                  │  │   │
│  │ │ +212712345678 | Rabat            │  │   │
│  │ │ Skills: Python, Django, ...      │  │   │
│  │ │ [Télécharger CV] [Contact]       │  │   │
│  │ └──────────────────────────────────┘  │   │
│  └────────────────────────────────────────┘   │
│                                                │
│  Pagination: < 1 2 3 >                        │
└────────────────────────────────────────────────┘
```

---

## 🎯 QUICK REFERENCE

| Action | URL | User | Result |
|--------|-----|------|--------|
| Register Company | /login | Public | Company → pending |
| Approve Company | /admin | Admin | pending → approved |
| Edit Profile | /profile | Seeker | Save resume + skills |
| Download Resume | /cvtheque | Company | Opens candidate CV |
| Search Candidates | /cvtheque | Company | Filtered results |
| View Dashboard | /dashboard | Seeker | Show applications |
| ATS Pipeline | /dashboard | Company | Show candidates |

---

## ✅ VALIDATION RULES

### Company Registration
- Company Name: Minimum 2 characters
- Email: Valid email format required
- Password: Minimum 6 characters
- Contact Name: Minimum 1 character (split into firstName + lastName)
- All required fields must be filled

### Resume URL
- Must start with http:// or https://
- Must be valid URL format
- Link must be publicly accessible
- Preferred formats:
  - Google Drive: https://drive.google.com/file/d/.../
  - Dropbox: https://www.dropbox.com/s/.../
  - PDF URL: https://example.com/resume.pdf

### Skills
- Minimum 1 character per skill
- No duplicate skills
- Each skill becomes a tag
- Can be removed anytime

---

## 🐛 TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| "Too small" error on register | ✅ Fixed! Contact name now properly split |
| Admin can't see pending companies | Check admin role, refresh /admin page |
| Resume URL not saving | Check URL format starts with http:// |
| Can't find candidate in CVthèque | Verify skills are added to profile |
| Resume download is broken | Update URL if moved, check public access |
