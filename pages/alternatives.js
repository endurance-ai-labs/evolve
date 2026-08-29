/* =========================================================
   ALTERNATIVES PLATFORM
   The firm's stated differentiator, made operational:
   manager access, capacity, co-investment, vintage pacing
   and who is actually eligible for what.
   ========================================================= */

/* Declared before boot(): page constants used by render helpers must exist
   before the first render call. */
const ALT_ACCESS = {
  "F-046": ["Full allocation", "Fund VII, closed to new investors March 2026"],
  "F-047": ["Full allocation", "Fund VI, fully committed"],
  "F-048": ["Full allocation", "Growth IV, second close"],
  "F-049": ["Reduced", "Venture V, allocation cut to 60% of the request"],
  "F-050": ["Full allocation", "Secondaries III, currently investing"],
  "F-051": ["Invitation only", "Co-investment vehicle, no fee and no carry"],
  "F-052": ["Under review", "Continuation vehicle, first look"],
  "F-053": ["Full allocation", "Direct Lending IV, currently investing"],
  "F-055": ["Reduced", "Mezzanine III, oversubscribed"],
  "F-056": ["Full allocation", "Opportunistic Credit II, currently investing"],
  "F-059": ["Full allocation", "Value-Add V, currently investing"],
  "F-060": ["Full allocation", "Infrastructure III, fully committed"],
  "F-061": ["Full allocation", "Energy Transition I, first close"],
  "F-062": ["Closed", "Farmland II, fully committed and closed"],
  "F-070": ["Closed", "Opportunity Zone II, investment period ending"],
};

const ALT_RELATIONSHIPS = [
  ["Oakstone Private Equity",    2006, 4, "Four consecutive funds. Advisory board seat since Fund V."],
  ["Ledgewood Credit Partners",  2011, 3, "Direct lending since the platform's first vintage."],
  ["Stonebrook Infrastructure",  2012, 3, "Core-plus infrastructure and the energy transition sleeve."],
  ["Blackmere Secondaries",      2016, 3, "Shortens the J-curve for newer household programmes."],
  ["Marchmont Partners",         2009, 3, "Event-driven and mezzanine across two vehicles."],
  ["Harrowgate Real Estate",     2014, 2, "Core through value-add property. Marks under review."],
  ["Ferndale Growth Partners",   2015, 2, "Growth equity into software and health technology."],
  ["Quill River Ventures",       2013, 3, "Early-stage venture. Long duration, wide dispersion."],
];

boot({ subtitle: "Private Wealth Portal" }, function (app) {
  if (isExternal()) {
    app.innerHTML = gate("Not available in the client portal",
      "Your own commitments are on your household page.") + disclosure();
    return;
  }
  render();
});

function render() {
  const book = visibleHouseholds().map((h) => h.id);
  const cs = COMMITMENTS.filter((c) => book.indexOf(c.hhId) >= 0);
  const privFunds = FUNDS.filter((f) => f.isPrivate || ["HFLP", "INTV", "BDC", "NTREIT", "TOF"].indexOf(f.vehicle) >= 0);
  const commit = cs.reduce((s, c) => s + c.commitment, 0);
  const called = cs.reduce((s, c) => s + c.called, 0);
  const nav = cs.reduce((s, c) => s + c.nav, 0);
  const dist = cs.reduce((s, c) => s + c.distributed, 0);

  const eligible = visibleHouseholds().filter((h) => h.qualified);
  const participating = [...new Set(cs.map((c) => c.hhId))];
  const altPositions = POSITIONS.filter((p) => ["PE", "PC", "RE", "HF"].indexOf(p.assetClass) >= 0
    && book.indexOf(p.hhId) >= 0);
  const altValue = altPositions.reduce((s, p) => s + p.value, 0);
  const bookValue = visibleHouseholds().reduce((s, h) => s + h.mv, 0);

  $("#app").innerHTML = `
  ${toolbar("Alternatives Platform",
    `<span class="demo-chip mut">${privFunds.length} strategies</span>
     <span class="demo-chip mut">${ALT_RELATIONSHIPS.length} manager relationships</span>
     ${srcChips("pa")}`)}

  <div class="demo-kpis">
    <div class="demo-kpi"><div class="v">${fmtM(altValue)}</div><div class="l">In alternatives</div>
      <div class="s">${fmtPct((altValue / bookValue) * 100, 1)} of the book</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(commit)}</div><div class="l">Committed</div>
      <div class="s">${cs.length} positions across ${participating.length} households</div></div>
    <div class="demo-kpi"><div class="v">${fmtM(commit - called)}</div><div class="l">Uncalled</div>
      <div class="s">Reserved in short duration</div></div>
    <div class="demo-kpi"><div class="v">${fmtX((nav + dist) / called)}</div><div class="l">TVPI</div>
      <div class="s">${fmtX(dist / called)} distributed to date</div></div>
    <div class="demo-kpi"><div class="v">${participating.length} of ${eligible.length}</div>
      <div class="l">Eligible households participating</div>
      <div class="s">${eligible.length - participating.length} not yet allocated</div></div>
    <div class="demo-kpi"><div class="v">20+</div><div class="l">Years in alternatives</div>
      <div class="s">Across ${ALT_RELATIONSHIPS.length} manager relationships</div></div>
  </div>

  <div class="rp-note" style="margin:0 0 16px">
    Access is the whole game in private markets. The funds worth owning are capacity-constrained, and capacity
    goes to investors who have been there across vintages rather than to whoever calls this year. This page is
    where that history is made visible: what we can get, how much, and for whom.
  </div>

  ${panel("Manager access and capacity", `
    <div class="rp-scroll">
      <table class="demo-tbl">
        <thead><tr><th>Strategy</th><th>Manager</th><th>Asset class</th><th class="num">Vintage</th>
          <th class="num">Committed</th><th class="num">TVPI</th><th class="num">Net IRR</th>
          <th>Our access</th><th>Note</th></tr></thead>
        <tbody>${privFunds.map((f) => {
          const inBook = cs.filter((c) => c.fundId === f.id);
          const acc = ALT_ACCESS[f.id] || ["Open", "Evergreen or semi-liquid vehicle"];
          const tone = acc[0] === "Full allocation" ? "green" : acc[0] === "Invitation only" ? "blue"
                     : acc[0] === "Reduced" ? "amber" : acc[0] === "Closed" ? "gray" : "amber";
          return `<tr class="rp-click" onclick="location.href='/evolve/funds/fund/?id=${f.id}'">
            <td><b>${esc(f.name)}</b><div class="rp-note">${esc(f.vehicleLabel)}</div></td>
            <td class="dim">${esc(f.manager)}</td>
            <td class="dim">${esc(f.acLabel)}</td>
            <td class="num">${f.priv ? f.priv.vintage : "—"}</td>
            <td class="num">${inBook.length ? fmtM(inBook.reduce((s, c) => s + c.commitment, 0)) : "—"}</td>
            <td class="num">${f.priv ? fmtX(f.priv.tvpi) : "—"}</td>
            <td class="num">${f.priv ? ret(f.priv.irr, 1) : (f.y3 == null ? "—" : ret(f.y3, 1))}</td>
            <td>${pill(acc[0], tone)}</td>
            <td class="dim" style="white-space:normal;max-width:280px">${esc(acc[1])}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>
    <div class="rp-note" style="margin-top:10px">"Reduced" means the manager cut our allocation below what we
    asked for, which is the honest way to report an oversubscribed fund. "Invitation only" is the co-investment
    vehicle: no management fee and no carried interest, available to households already committed to the
    flagship.</div>`, { k: privFunds.length + " strategies" })}

  <div class="demo-grid demo-two" style="margin-top:22px">
    ${panel("Manager relationships", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Manager</th><th class="num">Since</th><th class="num">Funds</th><th>Relationship</th></tr></thead>
        <tbody>${ALT_RELATIONSHIPS.sort((a, b) => a[1] - b[1]).map((m) => `<tr
          class="rp-click" onclick="location.href='/evolve/managers/'">
          <td><b>${esc(m[0])}</b></td>
          <td class="num">${m[1]}</td>
          <td class="num">${m[2]}</td>
          <td class="dim" style="white-space:normal">${esc(m[3])}</td></tr>`).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">The oldest relationship on this page predates the firm.
      That is the point: the partners brought two decades of manager access with them, and access does not
      transfer to whoever has the largest platform.</div>`, { k: "Twenty years" })}

    ${panel("Eligibility and pacing", `
      <table class="demo-tbl" style="width:100%">
        <thead><tr><th>Household</th><th class="num">Assets</th><th class="num">Committed</th>
          <th class="num">Target</th><th>Standing</th></tr></thead>
        <tbody>${eligible.sort((a, b) => b.mv - a.mv).slice(0, 14).map((h) => {
          const mine = cs.filter((c) => c.hhId === h.id);
          const c = mine.reduce((s, x) => s + x.commitment, 0);
          const target = h.mv * ((MODEL[h.model].t.PE + MODEL[h.model].t.PC + MODEL[h.model].t.RE) / 100) * 1.4;
          const ratio = target ? c / target : 0;
          return `<tr class="rp-click" onclick="location.href='/evolve/households/household/?id=${h.id}&tab=private'">
            <td><b>${esc(h.name)}</b><div class="rp-note">${esc(h.modelName)}</div></td>
            <td class="num">${fmt$(h.mv)}</td>
            <td class="num">${c ? fmt$(c) : "—"}</td>
            <td class="num">${fmt$(target)}</td>
            <td>${!c ? pill("Not allocated", "amber")
              : ratio > 0.85 ? pill("At pace", "green")
              : pill("Under-committed", "blue")}</td></tr>`;
        }).join("")}</tbody>
      </table>
      <div class="rp-note" style="margin-top:10px">Target commitment is the model's private weight grossed up
      for the fact that a drawdown fund is never fully called. A household under-committed against target is not
      a problem to fix this quarter: pacing across vintages matters more than reaching the weight quickly.</div>`)}
  </div>

  <div style="margin-top:22px">
    ${panel("New fund approval", `
      ${approvalChain("alt-approval", [
        { role: "research", label: "Sourcing and first look", note: "Manager meeting and preliminary screen" },
        { role: "research", label: "Full due diligence", note: "Investment and operational review complete" },
        { role: "cio", label: "Committee vote", note: "Recorded in the minutes with the sizing" },
        { role: "ceo", label: "Allocation and capacity", note: "Firm allocation requested and confirmed" },
        { role: "pm", label: "Household allocation", note: "Sized against each household's pacing model" },
      ], { title: "Alternatives approval — new strategy" })}
      <div class="rp-note">Five steps rather than four, because a private fund carries a commitment a client
      cannot walk away from. The extra step is capacity: knowing what the manager will actually give us before
      anything is promised to a household.</div>`)}
  </div>

  ${disclosure("Every fund, manager and allocation on this page is invented.")}`;
}
