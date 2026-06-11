interface Props {
  sections: string[]
  active: number
}

export default function NavDots({ sections, active }: Props) {
  return (
    <nav className="nav-dots">
      {sections.map((id, i) => (
        <button
          key={id}
          className={`nav-dot${i === active ? ' active' : ''}`}
          onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
          aria-label={id}
        />
      ))}
    </nav>
  )
}
