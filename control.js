// TODO add loading screen

var db;
var labels = {
  category: "Category",
  hospital_type: "Hospital Type",
  hospital_ownership: "Hospital Ownership",
  // payer: "Payer",
  hospital: "Hospital",
  descr: "Short Description",
  state: "State",
};

const init = async () => {
  const sqlPromise = initSqlJs({
    locateFile: (filename) => "./lib/sqljs-wasm/sql-wasm.wasm",
  });
  const dataPromise = fetch(
    "https://anp-ts-demo.s3.ap-southeast-1.amazonaws.com/project.db"
  ).then((res) => res.arrayBuffer());
  // const dataPromise = await fetch("https://anp-ts-demo.s3.ap-southeast-1.amazonaws.com/project.db.gz")
  //   .then(res => pako.inflate(res.arrayBuffer())).catch(err => console.log(err))

  const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
  db = new SQL.Database(new Uint8Array(buf));
  const categories = db.exec("select * from category;")[0].values;
  const hospitalType = db.exec("select * from hospital_type;")[0].values;
  const hospitalOwnership = db.exec("select * from hospital_ownership;")[0]
    .values;
  const payer = db.exec("select * from payer;")[0].values;
  const hospital = db.exec("select * from hospital;")[0].values;
  const descr = db.exec("select * from descr;")[0].values;
  return [categories, hospitalType, hospitalOwnership, payer, hospital, descr];
};

init().then((data) => {
  console.log(data);
  const [
    categories,
    hospitalType,
    hospitalOwnership,
    payer,
    hospital,
    description,
  ] = data;
  setupDropdown("category", categories);
  setupDropdown("hospital_type", hospitalType);
  setupDropdown("hospital_ownership", hospitalOwnership);
  setupDropdown("hospital", hospital);
  setupDropdown("descr", description);

  setupDropdown(
    "state",
    Object.entries(stateAbbr)
      .map((k, v) => [k, v])
      .map((e) => e[0])
  );
  $("#main").css("display", "block");
  $("#loader").css("display", "none");
});

const query = () => {
  const values = {};

  for (let [k, _] of Object.entries(labels)) {
    console.log(`#${k}`);
    const s = $(`#${k}`);
    if (s.val() != -1) {
      values[k] = s.val();
    }
  }
  console.log(values);

  let sql = [
    "select m.*",
    "p.kind as payer",
    "c.name as category",
    "ht.kind as hospital_type",
    "ho.kind as hospital_ownership",
    "h.*",
  ];

  sql = [
    sql.join(", "),
    "from main m",
    "join payer p on m.payer_id = p.id",
    "join hospital_type ht on m.hospital_type_id = ht.id",
    "join hospital_ownership ho on m.hospital_ownership_id = ho.id",
    "join category c on m.category_id = c.id",
    "join hospital h on m.hospital_id = h.id",
    "where",
  ];

  let conds = [];

  for (let [k, v] of Object.entries(values)) {
    if (k === "state") {
      console.log(k, v);
      conds.push(`h.state = '${v}'`);
    } else {
      conds.push(`${k}_id = ${v}`);
    }
  }
  console.log(conds);

  sql = sql.join(" ");
  sql = `${sql} ${conds.join(" and ")}`;
  sql = `${sql} order by price desc limit 5`;
  console.log(sql);
  const res = db.exec(sql);
  console.log(res);
};

const setupDropdown = (id, data) => {
  const html = [
    `<div id="${id}-control" class="col-6">`,
    `<label for="${id}" class="form-label">${labels[id]}</label>`,
    `<select name="${id}" id="${id}" class="form-select">`,
    `<option value="-1">Any</option>`,
  ];

  for (let d of data) {
    html.push(`<option value="${d[0]}">${d[1]}</option>`);
  }
  html.push(`</select>`, `</div>`);
  const s = $.parseHTML(html.join(""));
  $("#control").append(s);
  $(s).on("change", query);
};

const listResult = (results) => {
  const tmpl = [];
  const res = $("#result");
  const cols = results[0].columns;

  results[0].values.forEach((r) => {
    const name = r[cols.indexOf("name")];
    const rating = r[cols.indexOf("hospital_rating")];

    const row = [
      `<div class="result-row row border-bottom p-1 m-1">`,
      `<div class="hospital p-1">`,
      `<div class="name h5">${name}</div>`,
      `<div class="rating">`,
      `<span class="val">`,
    ];

    for (let i = 0; i < 5; i++) {
      if (i < rating) {
        row.push(`<span class="fa fa-star checked"></span>`);
      } else {
        row.push(`<span class="fa fa-star"></span>`);
      }
    }

    row = [
      ...row,
      `</span>`,
      `</div>`,
      `<div class="address">`,
      `<a class="text-decoration-none" target="_blank"`,
      `href="https://maps.google.com/?q=`,
    ];
  });

  const VT = [
    '                href="https://maps.google.com/?q=METHODIST HOSPITAL UNION COUNTY,4604 US HIGHWAY 60 WEST,MORGANFIELD,Kentucky, KY, 42437"',
    "              >",
    "                <p>",
    '                  <i class="fa-solid fa-location-dot text-info"></i>',
    '                  <span class="text-muted"',
    "                    >4604 US HIGHWAY 60 WEST, MORGANFIELD, KY 42437 - (123)",
    "                    456-789",
    "                  </span>",
    "                </p>",
    "              </a>",
    "            </div>",
    "",
    '            <div class="desc text-muted">',
    '              <i class="fa-solid fa-hospital"></i>',
    '              <span class="type">Critical Access Hospitals</span>',
    '              <span class="ownership"',
    "                ><small>- Voluntary non-profit - Church</small></span",
    "              >",
    "            </div>",
    '            <div class="desc text-muted">',
    '              <i class="fa-solid fa-truck-medical"></i>',
    '              <span class="attr">Emergency Service?</span>',
    '              <span class="val">',
    '                <i class="fa-solid fa-check text-success"></i>',
    '                <!-- <i class="fa-solid fa-xmark text-danger"></i> -->',
    "              </span>",
    "            </div>",
    '            <div class="desc text-muted">',
    '              <i class="fa-solid fa-bed-pulse"></i> 234 Beds',
    "            </div>",
    '            <div class="desc text-muted">',
    '              <span class="price"',
    '                ><i class="fa-solid fa-tags"></i> Historical Price:',
    "                $454.79</span",
    "              >",
    '              <i class="fa-sharp fa-solid fa-arrow-up text-danger"></i>',
    "              Compare to recommended price:",
    "                $254.79</span",
    "              >",
    "            </div>",
    "          </div>",
    "        </div>",
  ];
};
