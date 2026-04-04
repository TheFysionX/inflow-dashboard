export const loaderVariantFamilies = [
  {
    id: 'original-family',
    title: 'Original Family',
    subtitle: 'Keep the live DNA, but compare a few cleaner and more intentional spinoffs.',
    variants: [
      {
        badge: 'Live default',
        key: 'facet',
        note: 'The current live direction: balanced faceting, cool neon edges, and the crisp structured feel you already approved.',
        subtitle: 'Balanced polygon system',
        title: 'Facet',
      },
      {
        badge: 'Warm ceremonial',
        key: 'crown',
        note: 'The crowned version you liked. It keeps the framed geometry, but leans warmer and more regal at the perimeter.',
        subtitle: 'Crowned perimeter',
        title: 'Crown',
      },
      {
        badge: 'Refined aperture',
        key: 'aperture',
        note: 'A closer cousin to the original with a cleaner lens-like profile, tighter line work, and a calmer technical read.',
        subtitle: 'Lens-tuned spinoff',
        title: 'Aperture',
      },
      {
        badge: 'Signal frame',
        key: 'vector',
        note: 'Another original-adjacent option that keeps the layered framed device look, but pushes it toward a sharper, more vector-forward chassis.',
        subtitle: 'Vector chassis',
        title: 'Vector',
      },
      {
        badge: 'Crosshair core',
        key: 'axis',
        note: 'Still recognizably from the original family, but with stronger directional symmetry and a more operator-console feel.',
        subtitle: 'Aligned systems spinoff',
        title: 'Axis',
      },
    ],
  },
  {
    id: 'new-directions',
    title: 'Twenty New Directions',
    subtitle: 'These are true departures: scene-based loaders, off-center compositions, and calmer interface-like motion instead of centered emblems.',
    variants: [
      {
        badge: 'Angled stack',
        key: 'ember',
        note: 'A staggered warm card stack that feels like shifting panes or a queue in motion, not a centered device.',
        subtitle: 'Offset glass stack',
        title: 'Ember',
      },
      {
        badge: 'Status rail',
        key: 'signal',
        note: 'A right-weighted system panel with staged rows and signal pips, reading more like a live console than a spinner.',
        subtitle: 'Console queue',
        title: 'Signal',
      },
      {
        badge: 'Diagonal trail',
        key: 'nova',
        note: 'A progression of rising tiles moving along a diagonal path, almost like progress stepping across the view.',
        subtitle: 'Tile trail',
        title: 'Nova',
      },
      {
        badge: 'Ribbon lanes',
        key: 'helix',
        note: 'Wide flowing lanes passing through one another in a calmer, horizontal motion language.',
        subtitle: 'Flow lanes',
        title: 'Helix',
      },
      {
        badge: 'Sidebar form',
        key: 'glyph',
        note: 'A left-anchored panel with supporting side modules, closer to a premium product shell than a logo mark.',
        subtitle: 'Product shell',
        title: 'Glyph',
      },
      {
        badge: 'Split gateway',
        key: 'monolith',
        note: 'A tall split structure with a low dock, giving it a doorway or gateway feel instead of a spinner feel.',
        subtitle: 'Gateway scene',
        title: 'Monolith',
      },
      {
        badge: 'Soft cluster',
        key: 'bloom',
        note: 'Rounded clustered cards arranged like a soft composition board, with more atmosphere than machinery.',
        subtitle: 'Clustered panes',
        title: 'Bloom',
      },
      {
        badge: 'Conveyor run',
        key: 'relay',
        note: 'A row of modular blocks stepping through a handoff sequence along a grounded conveyor-like base.',
        subtitle: 'Conveyor cadence',
        title: 'Relay',
      },
      {
        badge: 'Mosaic shards',
        key: 'shard',
        note: 'Broken glass-like panels arranged asymmetrically, giving a sharper editorial mosaic feeling.',
        subtitle: 'Asymmetric mosaic',
        title: 'Shard',
      },
      {
        badge: 'Dark window',
        key: 'eclipse',
        note: 'A cinematic dark window with a strong side bias and restrained movement, more like a portal than a loader icon.',
        subtitle: 'Cinematic portal',
        title: 'Eclipse',
      },
      {
        badge: 'Horizon bands',
        key: 'aurora',
        note: 'Layered horizon bands near the bottom of the frame, like calm atmospheric strata moving through fog.',
        subtitle: 'Atmospheric horizon',
        title: 'Aurora',
      },
      {
        badge: 'Low waves',
        key: 'tide',
        note: 'A stack of rolling low bands that move like tide lines or soft telemetry waves near the base.',
        subtitle: 'Band motion',
        title: 'Tide',
      },
      {
        badge: 'Dock forge',
        key: 'forge',
        note: 'A heavy dock with rising blocks, giving the sense of shapes being built upward from a platform.',
        subtitle: 'Built upward',
        title: 'Forge',
      },
      {
        badge: 'Drifting facets',
        key: 'kite',
        note: 'Angular facets drifting diagonally across the canvas, airy and suspended rather than centered.',
        subtitle: 'Suspended facets',
        title: 'Kite',
      },
      {
        badge: 'Stair step',
        key: 'pulse',
        note: 'A staircase of blocks that lifts upward one step at a time, simple and clean without feeling symbolic.',
        subtitle: 'Stepped cadence',
        title: 'Pulse',
      },
      {
        badge: 'Crossed planes',
        key: 'weave',
        note: 'Broad intersecting planes that feel woven together, but more like product surfaces than technical wireframes.',
        subtitle: 'Interlocked planes',
        title: 'Weave',
      },
      {
        badge: 'Skyline peaks',
        key: 'zenith',
        note: 'A peaked skyline composition that rises asymmetrically, like a modern city silhouette cut into glass.',
        subtitle: 'Peaked skyline',
        title: 'Zenith',
      },
      {
        badge: 'Dock bays',
        key: 'harbor',
        note: 'An anchored scene with one tall left tower and a row of dock bays, stable and operational.',
        subtitle: 'Anchored bays',
        title: 'Harbor',
      },
      {
        badge: 'Glass drift',
        key: 'mirage',
        note: 'Overlapping floating panes with a subtle drift, like layered glass windows sliding past each other.',
        subtitle: 'Layered panes',
        title: 'Mirage',
      },
      {
        badge: 'Air sheets',
        key: 'lucid',
        note: 'The most reduced scene of the set: mostly empty space with a few light sheets and a very restrained motion profile.',
        subtitle: 'Minimal sheets',
        title: 'Lucid',
      },
    ],
  },
]

export const loaderVariants = loaderVariantFamilies.flatMap((family) => family.variants)

export const routeLoaderVariantKeys = loaderVariants.map((variant) => variant.key)

export const originalRouteLoaderVariantKeys = loaderVariantFamilies[0].variants.map((variant) => variant.key)

export const exploratoryRouteLoaderVariantKeys = loaderVariantFamilies[1].variants.map((variant) => variant.key)

export const defaultRouteLoaderVariant = 'crown'
