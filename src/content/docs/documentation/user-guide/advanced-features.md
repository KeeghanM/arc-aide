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

## Rich Text Editor and Linking

ArcAide features a powerful rich text editor for all your content:

### Formatting Options

- **Bold**, _italic_, and `code` text
- Headers and subheaders
- Bullet points and numbered lists
- Block quotes for important information

### Internal Linking

Create connections between your campaign content using wiki-style links:

#### Creating Links

1. **Type double brackets** `[[]]` anywhere in your text
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

- Use **bold text** for important names and concepts
- Create _italic emphasis_ for thoughts or whispered dialogue
- Use `code formatting` for game mechanics or dice rolls
- Add block quotes for player handouts or NPC dialogue
- **Use internal links** to create rich interconnected content

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
