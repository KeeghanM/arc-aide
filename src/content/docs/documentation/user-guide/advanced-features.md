---
title: 'Advanced Features'
description: 'Advanced features including arc hierarchies, entity management, view modes, and linking system.'
sidebar:
  order: 2
---

# Advanced Features

## Arc Hierarchies

ArcAide supports nested arc structures to help organize complex campaigns:

### Parent and Child Arcs

- **Parent Arcs**: High-level campaign storylines or chapters
- **Child Arcs**: Specific adventures, encounters, or side quests within a larger story
- **Visual Navigation**: Easy navigation between related arcs using the parent/child display

### Example Structure

```
Campaign: Lost Mine of Phandelver
├── Chapter 1: Goblin Ambush (Parent Arc)
│   ├── The Road to Phandalin (Child Arc)
│   ├── Cragmaw Hideout Infiltration (Child Arc)
│   └── Rescuing Sildar (Child Arc)
├── Chapter 2: Phandalin (Parent Arc)
│   ├── Redbrand Troubles (Child Arc)
│   ├── Cragmaw Castle Assault (Child Arc)
│   └── Sister Garaele's Quest (Child Arc)
└── Chapter 3: Wave Echo Cave (Parent Arc)
    ├── The Lost Mine (Child Arc)
    └── Confronting the Black Spider (Child Arc)
```

### Creating Arc Hierarchies

1. **Create a parent arc** with the overall storyline
2. **Create child arcs** for specific encounters or sub-plots
3. **Link child arcs** to their parent using the parentArcId field
4. **Navigate easily** between related arcs using the interface

## Managing Campaign Entities

### Thing Types

Create custom categories to organize your campaign entities:

- **NPCs** - Non-player characters
- **Locations** - Important places
- **Items** - Magic items, important objects
- **Organizations** - Guilds, factions, groups
- **Plot Devices** - Mysterious elements, prophecies

### Creating Things

1. **Navigate to your campaign**
2. **Choose or create a Thing Type**
3. **Add a new Thing** with a descriptive name
4. **Write rich descriptions** using the built-in editor
5. **Link Things to Arcs** to show their involvement in storylines

## View and Edit Modes

ArcAide features a dual-mode interface designed to optimize your workflow between content creation and content consumption:

### Understanding the Modes

#### Edit Mode (Default)

**Purpose**: Content creation and modification

**Features**:

- Multi-column layout for efficient editing
- Full toolbar access and formatting options
- Individual section editors for each arc component
- Real-time auto-save functionality
- Complete editing capabilities for all content types

**Best for**:

- Campaign planning and preparation
- Creating new arcs and entities
- Updating content during sessions
- Detailed content organization

#### View Mode

**Purpose**: Clean content presentation optimized for reading and sharing

**Features**:

- Single-column narrative flow
- D&D-themed styling with parchment backgrounds
- Consolidated content with automatic section headers
- Minimal UI chrome for distraction-free reading
- Professional presentation suitable for players

**Best for**:

- Reading through campaign content
- Sharing content with players
- Reviewing completed arcs
- Print-friendly campaign handouts

### Switching Between Modes

**Mode Toggle Location**: Floating action button in the bottom-right corner of dashboard pages

**How to Switch**:

1. Look for the mode toggle button (appears on Arc, Thing, and Campaign pages)
2. Click to switch between "Edit" and "View" modes
3. Mode preference persists across navigation
4. Current mode applies to all content pages

### Content Presentation Differences

#### Arc Pages

**Edit Mode Layout**:

```
┌─────────────┬─────────────┐
│    Hook     │ Protagonist │
├─────────────┼─────────────┤
│ Antagonist  │   Problem   │
├─────────────┼─────────────┤
│     Key     │   Outcome   │
├─────────────┴─────────────┤
│          Notes            │
└───────────────────────────┘
```

**View Mode Layout**:

```
┌───────────────────────────┐
│         # Hook            │
│    (hook content)         │
│                           │
│      # Protagonist        │
│  (protagonist content)    │
│                           │
│      # Antagonist         │
│   (antagonist content)    │
│                           │
│       # Problem           │
│    (problem content)      │
│                           │
│         # Key             │
│     (key content)         │
│                           │
│       # Outcome           │
│    (outcome content)      │
│                           │
│        # Notes            │
│     (notes content)       │
└───────────────────────────┘
```

#### Thing Pages

**Edit Mode**: Traditional editor interface with full toolbar

**View Mode**: Clean D&D-styled presentation with parchment backgrounds

### D&D Theme Elements (View Mode)

When in View Mode, content is styled with authentic D&D 5e visual elements:

#### Typography

- **Bookinsanity**: Primary content font
- **Mr Eaves Small Caps**: Section headers
- **Parchment backgrounds**: Authentic medieval appearance
- **Proper spacing**: Print-friendly margins and line heights

#### Visual Elements

- **Section dividers**: Colored underlines for headers
- **Stat blocks**: Properly formatted monster/NPC statistics
- **Spell descriptions**: Appropriate magical content styling
- **Tables**: Official-style ability scores and information

#### Content Organization

- **Automatic headers**: Section names added automatically
- **Flowing narrative**: Single-column design promotes reading
- **Connected content**: Internal links maintained and styled appropriately

## Publishing and Content Sharing

ArcAide includes powerful publishing features that allow you to share your campaign content with players while maintaining control over what information is visible.

### Publishing System

Publishing is a premium feature that enables you to create public links to your campaign content. When content is published, it becomes accessible via public URLs that you can share with your players.

#### Publishing Controls

**Campaign Publishing**: Publish entire campaigns to create a public campaign page

**Arc Publishing**: Share specific story arcs with players

**Thing Publishing**: Make individual NPCs, locations, or items publicly viewable

#### Publishing Interface

Each publishable piece of content includes a publish toggle button that shows:

- **Published Status**: Green "Published" button with checkmark when content is live
- **Unpublished Status**: Red "Unpublished" button with X when content is private
- **Public Links**: Direct links to published content for easy sharing
- **Quick Toggle**: One-click publishing and unpublishing

#### Content URLs

Published content is accessible at predictable URLs:

- **Campaigns**: `/campaign/[campaign-slug]/`
- **Arcs**: `/campaign/[campaign-slug]/arc/[arc-slug]/`
- **Things**: `/campaign/[campaign-slug]/thing/[thing-slug]/`

### Secret Content System

ArcAide includes a sophisticated secret content system that allows you to hide specific paragraphs or sections from published pages while keeping them visible in your private editing interface.

#### How Secrets Work

**Visual Indicators**: Secret content is highlighted with a red background in edit mode

**Click to Toggle**: Click any paragraph to mark it as secret or public

**Publishing Filter**: Secret content is automatically excluded from published pages

**DM-Only Information**: Perfect for hiding plot twists, DM notes, or sensitive information

#### Using the Secret System

1. **Enable Publishing Mode**: Premium subscribers see interactive paragraph highlighting
2. **Click Paragraphs**: Click any paragraph to toggle its secret status
3. **Visual Feedback**:
   - Red background = Secret (hidden from players)
   - Normal background = Public (visible to players)
   - Hover effects show clickable areas
4. **Automatic Filtering**: Published pages only show non-secret content

#### Secret Content Examples

- **Plot Twists**: Hide surprise reveals until the right moment
- **DM Notes**: Keep mechanical notes private while sharing story content
- **Alternative Outcomes**: Hide unused story branches from players
- **Sensitive Information**: Conceal information players shouldn't know yet

### Premium Publishing Features

Publishing features require a premium subscription due to hosting costs:

**Public Hosting**: Shared links are hosted on ArcAide's servers
**Bandwidth Costs**: Public content incurs hosting and delivery costs
**Premium Value**: Supports continued development and feature expansion

**Free Alternative**: You can still share content by copying text or using screen sharing

## Rich Text Editor and Linking

ArcAide features a powerful rich text editor with an interactive toolbar and keyboard shortcuts for all your content:

### Editor Interface

The editor automatically adapts to your workflow:

- **Focus-aware toolbar**: Formatting buttons appear when the editor is active
- **Keyboard shortcuts**: Quick formatting using familiar key combinations
- **Visual feedback**: Real-time preview of markdown formatting
- **Smart formatting**: Intelligent text wrapping and unwrapping
- **Publishing Integration**: Premium users see clickable paragraphs for secret content management

### Formatting Options

#### Text Formatting

- **Bold text** using `**text**` or Ctrl+B
- _Italic text_ using `*text*` or Ctrl+I
- <u>Underlined text</u> using `<u>text</u>` or Ctrl+U

#### Structure Elements

- **Headers** (H1-H5) using `#` syntax or the header dropdown
- Bullet points and numbered lists
- Block quotes for important information
- **Tables** for organized data presentation

#### Toolbar Features

The interactive toolbar provides one-click access to:

- **Bold, Italic, Underline** formatting buttons
- **Image insertion** with dual upload modes (URL and file upload)
- **Link creation** for internal references
- **Header dropdown** for different heading levels
- **Table generator** with basic table structure

### Image Handling

ArcAide supports two methods for adding images to your campaign content:

#### Image by URL (Free)

All users can add images using external URLs:

1. **Click the Image button** in the editor toolbar
2. **Select "URL mode"** in the image dialog
3. **Enter a descriptive label** for accessibility
4. **Paste the image URL** from any web source
5. **Click "Add Image"** to insert into your content

#### Image Upload (Premium Feature)

Premium subscribers can upload their own image files:

1. **Click the Image button** in the editor toolbar
2. **Select "File Upload mode"** in the image dialog
3. **Enter a descriptive label** for the image
4. **Choose a file** from your computer
5. **Upload automatically** to secure cloud storage
6. **Image is inserted** with optimized delivery

#### Premium Upgrade Prompts

Free users attempting file uploads will see educational prompts explaining:

- **Storage costs** and why uploads require premium
- **Alternative URL method** remains available
- **Premium benefits** including multiple campaigns
- **Easy upgrade process** to access full features

#### Image Features

- **Accessibility support** - Labels become alt text for screen readers
- **Responsive display** - Images adapt to different screen sizes
- **Secure storage** - Uploaded files stored on Cloudflare's global CDN
- **Optimized delivery** - Automatic image optimization and variant generation
- **Campaign organization** - All uploaded assets tied to specific campaigns

### Keyboard Shortcuts

Master these shortcuts for efficient content creation:

- **Ctrl+B**: Toggle bold formatting
- **Ctrl+I**: Toggle italic formatting
- **Ctrl+U**: Toggle underline formatting
- **Double brackets [[]]**: Create internal links

### Internal Linking

Create connections between your campaign content using wiki-style links:

#### Creating Links

1. **Type double brackets** `[[]]` anywhere in your text or click the link button
2. **Search interface appears** automatically within the editor
3. **Search and select** any Arc or Thing from your campaign
4. **Link is created** in the format `[[type#slug]]`

#### Link Behavior

- **Clickable navigation** - Links take you directly to the referenced content
- **Visual distinction** - Links appear styled differently from regular text
- **Campaign context** - Links always navigate within your current campaign
- **Cross-references** - Create connections between related Arcs and Things

#### Examples

```
The party meets [[thing#tavern-keeper-joe]] at [[thing#prancing-pony]].
This connects to the main quest in [[arc#finding-the-lost-crown]].
```

#### Tips for Effective Linking

- **Link important NPCs** when they're first mentioned
- **Connect related locations** to show travel routes
- **Reference previous arcs** to maintain story continuity
- **Link items** to show their significance across storylines

### Writing Tips

- Use the **toolbar buttons** for quick formatting access
- Combine **keyboard shortcuts** with mouse selection for efficiency
- Use **bold text** for important names and concepts
- Create _italic emphasis_ for thoughts or whispered dialogue
- Use `code formatting` for game mechanics or dice rolls
- Add block quotes for player handouts or NPC dialogue
- **Use internal links** to create rich interconnected content
- **Tables** are perfect for stat blocks, treasure lists, or reference information

## Search and Discovery

### Finding Content

Use the search bar to quickly find:

- Specific NPCs by name
- Locations mentioned across arcs
- Items and their descriptions
- Story elements and plot points

### Search Tips

- Use partial names for broad results
- Search for keywords like "tavern" or "magic"
- Results show content highlights for context

## Campaign Organization

### Structuring Your Campaign

1. **Create major story arcs** for significant plot lines
2. **Use sub-arcs** for smaller adventures within larger stories
3. **Link related entities** to show connections
4. **Update arc outcomes** as your story progresses

### Best Practices

- **Start with the Hook** when planning new content
- **Define clear Problems** to drive player engagement
- **Prepare multiple Keys** for different player approaches
- **Consider Outcomes** that lead to future adventures

## Tips for Dungeon Masters

### Effective Arc Creation

1. **Hook with action** - Start with something happening
2. **Clear protagonists** - Players should know their role
3. **Memorable antagonists** - Give opposition personality
4. **Solvable problems** - Multiple solutions = player agency
5. **Meaningful outcomes** - Consequences affect the world

### Managing Complexity

- **Use sub-arcs** for complex storylines
- **Link related arcs** to show connections
- **Regular updates** keep information current
- **Player notes** help track their discoveries

### Preparation Strategies

- **Prepare flexible Keys** for different approaches
- **Plan multiple Outcomes** for player choices
- **Create backup NPCs** in case players go off-script
- **Use entity links** to show story connections
