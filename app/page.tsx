"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

type Portfolio = {
  id: string;
  fullName: string;
  title: string;
  picture: string;
  email: string;
  phone: string;
  address: string;
  about: string;
  education: string;
  skills: string;
  projects: string;
  experience: string;
  links: string;
  template: "simple" | "modern" | "creative";
  updatedAt: string;
};

type Screen = "home" | "manage" | "form" | "templates" | "preview";
type TemplateName = Portfolio["template"];
type Theme = "light" | "dark";
type FontSize = "small" | "medium" | "large";

const emptyPortfolio: Omit<Portfolio, "id" | "updatedAt"> = {
  fullName: "",
  title: "",
  picture: "",
  email: "",
  phone: "",
  address: "",
  about: "",
  education: "",
  skills: "",
  projects: "",
  experience: "",
  links: "",
  template: "simple",
};

const templates: { id: TemplateName; name: string; descriptor: string; number: string }[] = [
  { id: "simple", name: "Simple", descriptor: "A clean, simple layout.", number: "01" },
  { id: "modern", name: "Modern", descriptor: "A card-based layout.", number: "02" },
  { id: "creative", name: "Creative", descriptor: "A colorful, creative layout.", number: "03" },
];

function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>,
    edit: <><path d="m14 5 5 5" /><path d="M4 20h4l11-11a2.1 2.1 0 0 0-4-4L4 16v4Z" /></>,
    trash: <><path d="M4 7h16" /><path d="m6 7 1 13h10l1-13" /><path d="M9 7V4h6v3" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>,
    external: <><path d="M14 4h6v6" /><path d="m20 4-9 9" /><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 2Z" transform="translate(-1 -1)" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    moon: <path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" />,
  };
  return <svg {...common}>{paths[name] ?? paths.spark}</svg>;
}

function Avatar({ portfolio, className = "" }: { portfolio: Pick<Portfolio, "picture" | "fullName">; className?: string }) {
  const initials = portfolio.fullName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "Y";
  return (
    <div className={`avatar ${className}`} style={portfolio.picture ? { backgroundImage: `url("${portfolio.picture.replaceAll('"', "%22")}")` } : undefined}>
      {!portfolio.picture && initials}
    </div>
  );
}

function splitLines(value: string) {
  return value.split(/\r?\n/).map((entry) => entry.trim()).filter(Boolean);
}

async function requestPortfolios(): Promise<Portfolio[]> {
  const response = await fetch("/api/portfolios");
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not load portfolios.");
  return result.portfolios;
}

function PortfolioPreview({ portfolio }: { portfolio: Portfolio }) {
  const skills = splitLines(portfolio.skills);
  const projects = splitLines(portfolio.projects);
  const education = splitLines(portfolio.education);
  const experience = splitLines(portfolio.experience);
  const links = splitLines(portfolio.links).map((line) => {
    const [label, url] = line.includes("|") ? line.split("|", 2).map((part) => part.trim()) : [line, line];
    const href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
    return { label: label.replace(/^https?:\/\//, "").replace(/\/$/, ""), href };
  });

  const content = (
    <>
      {portfolio.about && <section className="portfolio-section"><h3>About</h3><p className="portfolio-copy">{portfolio.about}</p></section>}
      {experience.length > 0 && <section className="portfolio-section"><h3>Experience</h3><div className="portfolio-list">{experience.map((item, i) => <p key={i}>{item}</p>)}</div></section>}
      {projects.length > 0 && <section className="portfolio-section"><h3>Projects</h3><div className="project-list">{projects.map((item, i) => <article className="project-item" key={i}><span className="project-index">0{i + 1}</span><p>{item}</p><Icon name="arrow" size={16} /></article>)}</div></section>}
      {education.length > 0 && <section className="portfolio-section"><h3>Education</h3><div className="portfolio-list">{education.map((item, i) => <p key={i}>{item}</p>)}</div></section>}
      {skills.length > 0 && <section className="portfolio-section"><h3>Skills</h3><div className="skill-list">{skills.map((item, i) => <span key={i}>{item}</span>)}</div></section>}
      {links.length > 0 && <section className="portfolio-section"><h3>Links</h3><div className="link-list">{links.map((link, i) => <a key={i} href={link.href} target="_blank" rel="noreferrer">{link.label}<Icon name="external" size={14} /></a>)}</div></section>}
      {(portfolio.email || portfolio.phone || portfolio.address) && <section className="portfolio-contact"><h3>Contact</h3>{portfolio.email && <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>}{portfolio.phone && <p>{portfolio.phone}</p>}{portfolio.address && <p>{portfolio.address}</p>}</section>}
    </>
  );

  if (portfolio.template === "modern") {
    return <article className="portfolio-paper template-modern">
      <header className="modern-hero"><div><span className="eyebrow">PORTFOLIO</span><h2>{portfolio.fullName || "Your Name"}<span>.</span></h2><p>{portfolio.title || "Title"}</p></div><Avatar portfolio={portfolio} className="modern-avatar" /></header>
      <div className="modern-content"><aside className="modern-side"><span>LOCATION</span><p>{portfolio.address || " "}</p><span>SKILLS</span><div className="modern-skills">{skills.map((skill, i) => <b key={i}>{skill}</b>)}</div><span>EMAIL</span>{portfolio.email && <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>}</aside><div className="modern-main">{content}</div></div>
    </article>;
  }

  if (portfolio.template === "creative") {
    return <article className="portfolio-paper template-creative">
      <header className="creative-hero"><div className="creative-title"><span className="eyebrow">PORTFOLIO</span><h2>{portfolio.fullName || "Your Name"}</h2><p>{portfolio.title || "Title"}</p></div><div className="creative-photo-wrap"><div className="creative-orbit" aria-hidden="true" /><Avatar portfolio={portfolio} className="creative-avatar" /></div></header>
      <div className="creative-body">{portfolio.about && <aside className="creative-note"><span>ABOUT</span><p>{portfolio.about}</p></aside>}<div className="creative-sections">{experience.length > 0 && <section className="portfolio-section"><h3>Experience</h3><div className="portfolio-list">{experience.map((item, i) => <p key={i}>{item}</p>)}</div></section>}{projects.length > 0 && <section className="portfolio-section"><h3>Projects</h3><div className="project-list">{projects.map((item, i) => <article className="creative-project" key={i}><span>0{i + 1}</span><p>{item}</p></article>)}</div></section>}{education.length > 0 && <section className="portfolio-section"><h3>Education</h3><div className="portfolio-list">{education.map((item, i) => <p key={i}>{item}</p>)}</div></section>}{skills.length > 0 && <section className="portfolio-section"><h3>Skills</h3><div className="skill-list">{skills.map((item, i) => <span key={i}>{item}</span>)}</div></section>}{links.length > 0 && <section className="portfolio-section"><h3>Links</h3><div className="link-list">{links.map((link, i) => <a key={i} href={link.href} target="_blank" rel="noreferrer">{link.label}<Icon name="external" size={14} /></a>)}</div></section>}{(portfolio.email || portfolio.phone) && <section className="portfolio-contact"><h3>Contact</h3>{portfolio.email && <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>}{portfolio.phone && <p>{portfolio.phone}</p>}</section>}</div></div>
    </article>;
  }

  return <article className="portfolio-paper template-simple">
    <header className="simple-hero"><Avatar portfolio={portfolio} className="simple-avatar" /><div><span className="eyebrow">PORTFOLIO</span><h2>{portfolio.fullName || "Your Name"}</h2><p>{portfolio.title || "Professional Title"}</p></div></header>
    <div className="simple-content">{content}</div>
  </article>;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("home");
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [draft, setDraft] = useState<Omit<Portfolio, "id" | "updatedAt">>(emptyPortfolio);
  const [active, setActive] = useState<Portfolio | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Portfolio | null>(null);

  const loadPortfolios = useCallback(async () => {
    try {
      setPortfolios(await requestPortfolios());
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to the database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    requestPortfolios().then((result) => {
      if (!cancelled) setPortfolios(result);
    }).catch((err: unknown) => {
      if (!cancelled) setError(err instanceof Error ? err.message : "Could not connect to the database.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("portfolio-theme");
    const savedFontSize = localStorage.getItem("portfolio-font-size");
    const frame = window.requestAnimationFrame(() => {
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
      if (savedFontSize === "small" || savedFontSize === "medium" || savedFontSize === "large") {
        setFontSize(savedFontSize);
      }
      setSettingsLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!settingsLoaded) return;
    localStorage.setItem("portfolio-theme", theme);
    localStorage.setItem("portfolio-font-size", fontSize);
  }, [fontSize, settingsLoaded, theme]);

  const startNew = () => {
    setDraft(emptyPortfolio);
    setEditingId(null);
    setActive(null);
    setError("");
    setScreen("form");
  };

  const startEdit = (portfolio: Portfolio) => {
    const { id, updatedAt, ...values } = portfolio;
    void id; void updatedAt;
    setDraft(values);
    setEditingId(portfolio.id);
    setActive(portfolio);
    setError("");
    setScreen("form");
  };

  const saveInformation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(editingId ? `/api/portfolios/${editingId}` : "/api/portfolios", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save your portfolio.");
      const saved: Portfolio = result.portfolio;
      setActive(saved);
      setEditingId(saved.id);
      setDraft(({ ...saved }));
      await loadPortfolios();
      setScreen("templates");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your portfolio.");
    } finally {
      setSaving(false);
    }
  };

  const selectTemplate = async (template: TemplateName) => {
    if (!active) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/portfolios/${active.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...active, template }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not update the template.");
      setActive(result.portfolio);
      setDraft(({ ...result.portfolio }));
      await loadPortfolios();
      setScreen("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the template.");
    } finally {
      setSaving(false);
    }
  };

  const removePortfolio = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/portfolios/${deleteTarget.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete this portfolio.");
      setPortfolios((current) => current.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
      setNotice("Portfolio deleted.");
      window.setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this portfolio.");
    } finally {
      setSaving(false);
    }
  };

  const openPortfolio = (portfolio: Portfolio) => {
    setActive(portfolio);
    setDraft(({ ...portfolio }));
    setEditingId(portfolio.id);
    setScreen("preview");
  };

  const subtitle = useMemo(() => ({
    home: "Create and manage your portfolio.",
    manage: "View, edit, or delete saved portfolios.",
    form: editingId ? "Update your information." : "Enter your information.",
    templates: "Choose one of the three designs.",
    preview: "Review your portfolio.",
  }[screen]), [editingId, screen]);

  const setField = (field: keyof typeof emptyPortfolio, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  const draftPreview: Portfolio = { ...draft, id: editingId ?? "preview", updatedAt: "" };

  return (
    <main className="app-shell" data-theme={theme} data-font-size={fontSize}>
      <header className="topbar">
        <nav className="topnav" aria-label="Main navigation">
          <button className={screen === "home" ? "nav-active" : ""} onClick={() => setScreen("home")}>Home</button>
          <button className={screen === "manage" ? "nav-active" : ""} onClick={() => setScreen("manage")}>Portfolios <span className="nav-count">{portfolios.length}</span></button>
        </nav>
        <div className="settings-wrap">
          <button
            className="settings-toggle"
            type="button"
            aria-label="Settings"
            aria-expanded={settingsOpen}
            aria-controls="settings-panel"
            onClick={() => setSettingsOpen((open) => !open)}
          >
            <Icon name="settings" size={18} />
            <span>Settings</span>
          </button>
          {settingsOpen && <section className="settings-panel" id="settings-panel" aria-label="Display settings">
            <h2>Settings</h2>
            <div className="settings-group" role="group" aria-label="Color theme">
              <span>Theme</span>
              <div className="settings-options">
                <button type="button" className={theme === "light" ? "setting-selected" : ""} aria-pressed={theme === "light"} onClick={() => setTheme("light")}><Icon name="sun" size={15} /> Light</button>
                <button type="button" className={theme === "dark" ? "setting-selected" : ""} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}><Icon name="moon" size={15} /> Dark</button>
              </div>
            </div>
            <div className="settings-group" role="group" aria-label="Font size">
              <span>Font size</span>
              <div className="settings-options size-options">
                {(["small", "medium", "large"] as const).map((size) => <button type="button" key={size} className={fontSize === size ? "setting-selected" : ""} aria-pressed={fontSize === size} onClick={() => setFontSize(size)}>{size === "small" ? "A−" : size === "large" ? "A+" : "A"} <span>{size[0].toUpperCase() + size.slice(1)}</span></button>)}
              </div>
            </div>
          </section>}
        </div>
      </header>

      <div className="page-frame">
        {error && <div className="alert error-alert" role="alert"><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
        {notice && <div className="alert success-alert" role="status"><Icon name="check" size={17} />{notice}</div>}

        {screen === "home" && <section className="home-screen">
          <div className="home-copy">
            <h1>Portfolio Maker</h1>
            <p className="home-description">Add your details, choose a design, and save your portfolio.</p>
            <div className="hero-actions"><button className="button-primary" onClick={startNew}>Create portfolio <Icon name="arrow" /></button><button className="button-text" onClick={() => setScreen("manage")}>View portfolios <Icon name="arrow" size={16} /></button></div>
          </div>
          <div className="home-steps"><span>1. Enter your details</span><span>2. Choose a design</span><span>3. Preview and save</span></div>
        </section>}

        {screen !== "home" && <div className="workspace">
          <div className="workspace-heading">
            <button className="back-link" onClick={() => setScreen(active ? "manage" : "home")}><Icon name="back" size={16} /> Back</button>
            <h1>{screen === "manage" ? "Portfolios" : screen === "form" ? editingId ? "Edit portfolio" : "Create portfolio" : screen === "templates" ? "Choose a design" : "Preview portfolio"}</h1>
            {screen !== "form" && <p className="workspace-subtitle">{subtitle}</p>}
          </div>

          {screen === "manage" && <section className="manage-section">
            <div className="section-heading"><h2>{portfolios.length} saved</h2><button className="button-primary small-button" onClick={startNew}><Icon name="plus" size={16} /> Create portfolio</button></div>
            {loading ? <div className="empty-state"><span className="loading-spinner" />Loading...</div> : portfolios.length === 0 ? <div className="empty-state"><span className="empty-icon"><Icon name="grid" size={24} /></span><h3>No portfolios yet</h3><button className="button-primary" onClick={startNew}>Create portfolio <Icon name="arrow" size={16} /></button></div> : <div className="portfolio-grid">{portfolios.map((portfolio) => <article className="manage-card" key={portfolio.id}><button className={`manage-thumbnail thumb-${portfolio.template}`} onClick={() => openPortfolio(portfolio)} aria-label={`Preview ${portfolio.fullName}'s portfolio`}><span className="thumb-label">{portfolio.template}</span><Avatar portfolio={portfolio} className="thumb-avatar" /><strong>{portfolio.fullName || "Untitled portfolio"}</strong><span>{portfolio.title || "Portfolio"}</span><div className="thumb-lines"><i /><i /><i /></div></button><div className="manage-card-info"><div><h3>{portfolio.fullName || "Untitled portfolio"}</h3><p>{portfolio.title || "No title"}</p></div><button className="icon-button" onClick={() => startEdit(portfolio)} aria-label={`Edit ${portfolio.fullName}`}><Icon name="edit" size={17} /></button></div><div className="manage-card-actions"><button onClick={() => openPortfolio(portfolio)}>View <Icon name="arrow" size={15} /></button><button className="delete-action" onClick={() => setDeleteTarget(portfolio)} aria-label={`Delete ${portfolio.fullName}`}><Icon name="trash" size={16} /></button></div></article>)}</div>}
          </section>}

          {screen === "form" && <form className="portfolio-form" onSubmit={saveInformation}>
            <div className="form-editor-layout">
              <div className="form-editor-fields">
            <div className="form-intro"><span className="step-count">1 <span>/</span> 3</span><div><h2>Personal information</h2><p>Fields marked * are required.</p></div></div>
            <div className="form-section"><div className="form-section-title"><span className="section-index">1</span><div><h3>About you</h3></div></div><div className="fields-grid"><label className="field"><span>Full name <b>*</b></span><input required maxLength={100} value={draft.fullName} onChange={(e) => setField("fullName", e.target.value)} placeholder="Your name" /></label><label className="field"><span>Title</span><input maxLength={120} value={draft.title} onChange={(e) => setField("title", e.target.value)} placeholder="Student, designer, developer..." /></label><label className="field"><span>Email</span><input type="email" maxLength={254} value={draft.email} onChange={(e) => setField("email", e.target.value)} placeholder="name@example.com" /></label><label className="field"><span>Phone</span><input type="tel" maxLength={40} value={draft.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="Phone number" /></label><label className="field"><span>Address</span><input maxLength={200} value={draft.address} onChange={(e) => setField("address", e.target.value)} placeholder="City, country" /></label><label className="field"><span>Profile picture URL</span><input type="url" maxLength={1000} value={draft.picture} onChange={(e) => setField("picture", e.target.value)} placeholder="https://example.com/photo.jpg" /><small>Use a public image URL.</small></label></div></div>
            <div className="form-section"><div className="form-section-title"><span className="section-index">2</span><div><h3>Education and work</h3></div></div><div className="fields-grid"><label className="field field-full"><span>About me</span><textarea rows={4} maxLength={2000} value={draft.about} onChange={(e) => setField("about", e.target.value)} placeholder="Write a short introduction." /></label><label className="field"><span>Education</span><textarea rows={4} maxLength={2000} value={draft.education} onChange={(e) => setField("education", e.target.value)} placeholder={"One item per line\nSchool, program, year"} /><small>One item per line.</small></label><label className="field"><span>Work experience</span><textarea rows={4} maxLength={3000} value={draft.experience} onChange={(e) => setField("experience", e.target.value)} placeholder={"One job per line\nJob title, company, year"} /><small>One job per line.</small></label><label className="field"><span>Skills</span><textarea rows={3} maxLength={1200} value={draft.skills} onChange={(e) => setField("skills", e.target.value)} placeholder={"One skill per line\nWriting\nCoding"} /><small>One skill per line.</small></label><label className="field"><span>Projects</span><textarea rows={3} maxLength={3000} value={draft.projects} onChange={(e) => setField("projects", e.target.value)} placeholder={"One project per line\nProject name and short description"} /><small>One project per line.</small></label><label className="field field-full"><span>Social media and website links</span><textarea rows={3} maxLength={2000} value={draft.links} onChange={(e) => setField("links", e.target.value)} placeholder={"One URL per line\nhttps://example.com"} /><small>One URL per line. Optional label: Instagram | URL</small></label></div></div>
            {active && <button className="form-change-template" type="button" onClick={() => { setActive({ ...active, ...draft }); setScreen("templates"); }}><Icon name="grid" size={16} /> Change your template <span>{active.template}</span></button>}
              </div>
              <aside className="form-live-preview"><h2>Preview</h2><PortfolioPreview portfolio={draftPreview} /></aside>
            </div>
            <div className="form-footer"><span><span className="required-star">*</span> Required</span><button type="submit" className="button-primary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Save & choose design"} {!saving && <Icon name="arrow" size={17} />}</button></div>
          </form>}

          {screen === "templates" && active && <section className="template-section">          <div className="template-step"><span className="step-count">2 <span>/</span> 3</span><div><h2>Select a template</h2></div></div><div className="template-options">{templates.map((template) => <button className={`template-choice ${active.template === template.id ? "selected" : ""}`} key={template.id} onClick={() => void selectTemplate(template.id)} disabled={saving}><div className={`template-swatch swatch-${template.id}`}><div className="swatch-window"><span>{active.fullName || "Your Name"}</span><i /><i /><i /></div><span className="swatch-number">{template.number}</span></div><div className="template-choice-info"><div><h3>{template.name}</h3><p>{template.descriptor}</p></div><span className="template-radio">{active.template === template.id && <Icon name="check" size={14} />}</span></div></button>)}</div><div className="template-footer"><span>3 / 3</span><button className="button-primary" onClick={() => setScreen("preview")} disabled={saving}>Preview <Icon name="arrow" size={17} /></button></div></section>}

          {screen === "preview" && active && <section className="preview-section"><div className="preview-toolbar"><div><span className="step-count">3 <span>/</span> 3</span><div><h2>Portfolio preview</h2></div></div><div className="preview-actions"><button className="button-secondary" onClick={() => startEdit(active)}><Icon name="edit" size={16} /> Edit</button><button className="button-primary" onClick={() => window.print()}><Icon name="external" size={16} /> Print</button></div></div><div className="preview-canvas"><div className="preview-page-label"><span><span className="live-dot" /> PREVIEW</span><button onClick={() => setScreen("templates")}><Icon name="grid" size={15} /> {active.template} <span>· Change</span></button></div><PortfolioPreview portfolio={active} /></div><div className="preview-bottom"><div><h3>Portfolio saved</h3></div><button className="button-primary" onClick={() => setScreen("manage")}>View portfolios <Icon name="arrow" size={17} /></button></div></section>}
        </div>}
      </div>

      <footer className="site-footer" />

      {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDeleteTarget(null); }}><section className="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><span className="modal-icon"><Icon name="trash" size={21} /></span><h2 id="delete-title">Delete portfolio?</h2><p>Delete <strong>{deleteTarget.fullName || "this portfolio"}</strong>? This cannot be undone.</p>{error && <p className="modal-error">{error}</p>}<div><button className="button-secondary" onClick={() => { setDeleteTarget(null); setError(""); }} disabled={saving}>Cancel</button><button className="button-danger" onClick={() => void removePortfolio()} disabled={saving}>{saving ? "Deleting..." : "Delete"}</button></div></section></div>}
    </main>
  );
}
