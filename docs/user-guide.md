# User Guide

Welcome to ArcAide! This guide will help you get started with managing your D&D campaigns using our arc-based storytelling approach.

## Getting Started

### Creating Your First Campaign

1. **Sign up or log in** to your ArcAide account
2. **Click "Get Started"** or navigate to the dashboard
3. **Create a new campaign** by clicking the "+" button
4. **Enter your campaign name** (e.g., "Lost Mine of Phandelver")
5. **Start creating arcs** to structure your storylines

### Understanding Campaigns

Campaigns are the top-level containers for organizing your D&D adventures. Each campaign can contain:

- Multiple story arcs
- Campaign entities (NPCs, locations, items)
- Custom entity types
- Rich text descriptions and notes

## The Arc Framework

ArcAide uses a structured six-part framework to help you create compelling storylines:

### 1. Hook

The opening scene or inciting incident that draws your players into the story.

**Example:** _"While traveling to Phandalin, the party discovers an abandoned wagon with signs of a struggle and goblin tracks leading into the woods."_

### 2. Protagonist

The main character(s) or heroes of this particular story arc.

**Example:** _"The adventuring party, hired by Gundren Rockseeker to escort supplies to Phandalin."_

### 3. Antagonist

The opposition, conflict source, or "villain" of the arc.

**Example:** _"Klarg, the bugbear leader of a goblin tribe that has captured Gundren and his escort."_

### 4. Problem

The central challenge or conflict that needs to be resolved.

**Example:** _"Gundren has been captured and his location is unknown. The supplies he was expecting are crucial for the town's defense."_

### 5. Key

The solution, tool, method, or insight needed to resolve the problem.

**Example:** _"Following the goblin tracks to their hideout, gathering information from captured goblins, and staging a rescue mission."_

### 6. Outcome

The resolution and consequences of the arc's events.

**Example:** _"Gundren is rescued and reveals the location of Wave Echo Cave. The party learns about the Black Spider's involvement."_

### 7. Notes

Additional notes and supplementary information that doesn't fit into the other categories.

**Example:** _"Player feedback: loved the goblin ambush tactics. Next time, add more environmental hazards to the hideout."_

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

### Best Practices

#### When to Use Edit Mode

- **Active campaign preparation**: Creating and organizing new content
- **Session updates**: Making changes during or after game sessions
- **Complex editing**: When you need access to formatting tools
- **Multi-section work**: When working on multiple arc components

#### When to Use View Mode

- **Content review**: Reading through existing campaign material
- **Player sharing**: When showing content to players at the table
- **Campaign handouts**: For printing or sharing reference material
- **Immersive reading**: When you want to experience content as a narrative

#### Mode Workflow Tips

1. **Plan in Edit Mode**: Create and organize content using the multi-column interface
2. **Review in View Mode**: Switch to view mode to read content as a flowing narrative
3. **Share in View Mode**: Use view mode when showing content to others
4. **Quick edits**: Switch back to edit mode for immediate changes

### Technical Notes

#### Performance

- Mode switching is instant with no page reload
- Content is the same in both modes, only presentation changes
- Auto-save continues to work in both modes

#### Data Consistency

- All content remains fully editable regardless of current mode
- Mode preference is stored locally and persists between sessions
- No data loss occurs when switching modes

#### Mobile Considerations

- View mode is optimized for mobile reading
- Edit mode maintains functionality on mobile devices
- Mode toggle remains accessible on all screen sizes

This dual-mode system allows you to optimize your interface for the task at hand—whether you're creating epic adventures or immersing yourself in the worlds you've built.

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

## Collaboration Features

### Sharing Content

- **Export campaign data** for backup or sharing
- **Print-friendly views** for table reference
- **Mobile access** for on-the-go updates

### Session Management

- **Update arcs** during or after sessions
- **Add new Things** discovered during play
- **Track outcomes** and their consequences
- **Plan future content** based on player decisions

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

## Troubleshooting

### Common Issues

**Can't find content?**

- Use the search feature to locate items
- Check if content is in the correct campaign
- Verify spelling in search terms

**Lost changes?**

- Content auto-saves as you type
- Refresh the page if changes aren't appearing
- Check your internet connection

**Formatting problems?**

- Use the editor toolbar for consistent formatting
- Copy and paste may lose some formatting
- Re-apply formatting using editor tools

### Getting Help

- Check the documentation for detailed guides
- Contact support for technical issues
- Join the community for tips and inspiration

## Advanced Features

### Hierarchical Arcs

Create nested storylines with enhanced parent-child relationships:

- **Main Arcs**: The overall campaign story or major chapters
- **Sub-arcs**: Individual adventures, encounters, or side quests
- **Visual Hierarchy**: Parent arcs display their children, with easy navigation
- **Flexible Organization**: Reorganize arcs by changing parent relationships
- **Connected Outcomes**: Child arc outcomes feed into parent arc narratives

### Entity Relationships

Track complex connections:

- **NPC relationships** - allies, enemies, family
- **Location connections** - roads, political boundaries
- **Item histories** - creators, previous owners

### Campaign Analytics

Track your campaign's growth:

- **Content statistics** - arcs, entities, total content
- **Recent activity** - what you've been working on
- **Usage patterns** - most-referenced content

---

_Happy adventuring! May your campaigns be epic and your players engaged._
