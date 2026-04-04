function repeat(count, renderItem) {
  return Array.from({ length: count }, (_, index) => renderItem(index))
}

function EmberLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--ember">
      <span className="route-loader-exp__glow route-loader-exp__glow--a" />
      <span className="route-loader-exp__glow route-loader-exp__glow--b" />
      <div className="route-loader-exp-stack">
        <span className="route-loader-exp-stack__tag" />
        <span className="route-loader-exp-stack__card route-loader-exp-stack__card--back" />
        <span className="route-loader-exp-stack__card route-loader-exp-stack__card--mid" />
        <span className="route-loader-exp-stack__card route-loader-exp-stack__card--front" />
      </div>
    </div>
  )
}

function SignalLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--signal">
      <span className="route-loader-exp__glow route-loader-exp__glow--a" />
      <div className="route-loader-exp-console">
        <div className="route-loader-exp-console__rail">
          {repeat(4, (index) => (
            <span className="route-loader-exp-console__pip" key={index} />
          ))}
        </div>
        <div className="route-loader-exp-console__panel">
          {repeat(4, (index) => (
            <div className="route-loader-exp-console__row" key={index}>
              <span className="route-loader-exp-console__dot" />
              <span className="route-loader-exp-console__line route-loader-exp-console__line--long" />
              <span className="route-loader-exp-console__line route-loader-exp-console__line--short" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NovaLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--nova">
      <span className="route-loader-exp__glow route-loader-exp__glow--a" />
      <div className="route-loader-exp-trail">
        {repeat(5, (index) => (
          <span className="route-loader-exp-trail__tile" key={index} />
        ))}
      </div>
    </div>
  )
}

function HelixLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--helix">
      <span className="route-loader-exp__glow route-loader-exp__glow--a" />
      <span className="route-loader-exp__glow route-loader-exp__glow--b" />
      <div className="route-loader-exp-ribbons">
        {repeat(4, (index) => (
          <span className="route-loader-exp-ribbons__lane" key={index} />
        ))}
      </div>
    </div>
  )
}

function GlyphLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--glyph">
      <div className="route-loader-exp-shell">
        <div className="route-loader-exp-shell__sidebar">
          <span className="route-loader-exp-shell__sidebar-chip" />
          <span className="route-loader-exp-shell__sidebar-chip route-loader-exp-shell__sidebar-chip--short" />
        </div>
        <div className="route-loader-exp-shell__main">
          <span className="route-loader-exp-shell__headline" />
          <span className="route-loader-exp-shell__body" />
          <div className="route-loader-exp-shell__modules">
            {repeat(3, (index) => (
              <span className="route-loader-exp-shell__module" key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MonolithLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--monolith">
      <div className="route-loader-exp-gateway">
        <span className="route-loader-exp-gateway__tower route-loader-exp-gateway__tower--left" />
        <span className="route-loader-exp-gateway__tower route-loader-exp-gateway__tower--right" />
        <span className="route-loader-exp-gateway__dock" />
      </div>
    </div>
  )
}

function BloomLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--bloom">
      <span className="route-loader-exp__glow route-loader-exp__glow--a" />
      <div className="route-loader-exp-cluster">
        {repeat(4, (index) => (
          <span className="route-loader-exp-cluster__bubble" key={index} />
        ))}
      </div>
    </div>
  )
}

function RelayLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--relay">
      <div className="route-loader-exp-conveyor">
        <span className="route-loader-exp-conveyor__track" />
        {repeat(4, (index) => (
          <span className="route-loader-exp-conveyor__block" key={index} />
        ))}
      </div>
    </div>
  )
}

function ShardLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--shard">
      <div className="route-loader-exp-mosaic">
        {repeat(5, (index) => (
          <span className="route-loader-exp-mosaic__piece" key={index} />
        ))}
      </div>
    </div>
  )
}

function EclipseLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--eclipse">
      <div className="route-loader-exp-portal">
        <span className="route-loader-exp-portal__window" />
        <span className="route-loader-exp-portal__shelf" />
      </div>
    </div>
  )
}

function AuroraLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--aurora">
      <div className="route-loader-exp-horizon">
        {repeat(4, (index) => (
          <span className="route-loader-exp-horizon__band" key={index} />
        ))}
      </div>
    </div>
  )
}

function TideLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--tide">
      <div className="route-loader-exp-wavefield">
        {repeat(4, (index) => (
          <span className="route-loader-exp-wavefield__wave" key={index} />
        ))}
      </div>
    </div>
  )
}

function ForgeLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--forge">
      <div className="route-loader-exp-forge">
        <span className="route-loader-exp-forge__dock" />
        {repeat(3, (index) => (
          <span className="route-loader-exp-forge__pillar" key={index} />
        ))}
      </div>
    </div>
  )
}

function KiteLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--kite">
      <div className="route-loader-exp-facets">
        {repeat(4, (index) => (
          <span className="route-loader-exp-facets__kite" key={index} />
        ))}
      </div>
    </div>
  )
}

function PulseLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--pulse">
      <div className="route-loader-exp-stairs">
        {repeat(4, (index) => (
          <span className="route-loader-exp-stairs__step" key={index} />
        ))}
      </div>
    </div>
  )
}

function WeaveLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--weave">
      <div className="route-loader-exp-planes">
        <span className="route-loader-exp-planes__strip route-loader-exp-planes__strip--one" />
        <span className="route-loader-exp-planes__strip route-loader-exp-planes__strip--two" />
        <span className="route-loader-exp-planes__card" />
      </div>
    </div>
  )
}

function ZenithLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--zenith">
      <div className="route-loader-exp-skyline">
        {repeat(5, (index) => (
          <span className="route-loader-exp-skyline__peak" key={index} />
        ))}
      </div>
    </div>
  )
}

function HarborLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--harbor">
      <div className="route-loader-exp-harbor">
        <span className="route-loader-exp-harbor__tower" />
        <div className="route-loader-exp-harbor__bays">
          {repeat(3, (index) => (
            <span className="route-loader-exp-harbor__bay" key={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MirageLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--mirage">
      <div className="route-loader-exp-panes">
        {repeat(3, (index) => (
          <span className="route-loader-exp-panes__pane" key={index} />
        ))}
      </div>
    </div>
  )
}

function LucidLoader() {
  return (
    <div className="route-loader-exp route-loader-exp--lucid">
      <div className="route-loader-exp-sheets">
        <span className="route-loader-exp-sheets__sheet route-loader-exp-sheets__sheet--back" />
        <span className="route-loader-exp-sheets__sheet route-loader-exp-sheets__sheet--front" />
        <span className="route-loader-exp-sheets__tag" />
      </div>
    </div>
  )
}

const experimentalLoaders = {
  aurora: AuroraLoader,
  bloom: BloomLoader,
  eclipse: EclipseLoader,
  ember: EmberLoader,
  forge: ForgeLoader,
  glyph: GlyphLoader,
  harbor: HarborLoader,
  helix: HelixLoader,
  kite: KiteLoader,
  lucid: LucidLoader,
  mirage: MirageLoader,
  monolith: MonolithLoader,
  nova: NovaLoader,
  pulse: PulseLoader,
  relay: RelayLoader,
  shard: ShardLoader,
  signal: SignalLoader,
  tide: TideLoader,
  weave: WeaveLoader,
  zenith: ZenithLoader,
}

export default function ExperimentalRouteLoader({ variant }) {
  const LoaderComponent = experimentalLoaders[variant] ?? LucidLoader

  return <LoaderComponent />
}
