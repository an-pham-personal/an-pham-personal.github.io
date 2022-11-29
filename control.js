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
    const s = $(`#${k}`);
    if (s.val() != -1) {
      values[k] = s.val();
    }
  }

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
      conds.push(`h.state = '${v}'`);
    } else {
      conds.push(`${k}_id = ${v}`);
    }
  }
  console.log(conds);

  sql = sql.join(" ");
  sql = `${sql} ${conds.join(" and ")}`;
  sql = `${sql} order by price desc`;
  console.log(sql);
  const res = db.exec(sql);
  console.log(res);
  listResult(res);
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

const extractResult = (cols, r) => {
  const vals = {
    name: 1,
    hospital_rating: 1,
    address: 1,
    city: 1,
    state: 1,
    phone: 1,
    zip: 1,
    hospital_id: 1,
    hospital_rating: 1,
    hospital_type: 1,
    hospital_ownership: 1,
    emergency_services: 1,
    beds: 1,
    price: 1,
    predicted: 1,
  };
  Object.keys(vals).forEach((k) => (vals[k] = r[cols.indexOf(k)]));
  console.log(vals);
  return vals;
};

const listResult = (results) => {
  const res = $("#result");
  const cols = results[0].columns;
  let seen = new Set();
  let counter = 0;

  res.empty();
  res.removeClass("d-none");
  res.addClass("d-block");
  for (let r of results[0].values) {
    const v = extractResult(cols, r);

    if (seen.has(v.hospital_id)) {
      continue;
    }
    seen.add(v.hospital_id);

    let row = [
      `<div class="result-row row border-bottom p-1 m-1">`,
      `<div class="hospital p-1">`,
      `<div class="name h5">${v.name}</div>`,
      `<div class="rating">`,
      `<span class="val">`,
    ];

    for (let i = 0; i < 5; i++) {
      if (i < v.hospital_rating) {
        row.push(`<span class="fa fa-star checked"></span> `);
      } else {
        row.push(`<span class="fa fa-star"></span> `);
      }
    }

    row = [
      ...row,
      `</span>`,
      `</div>`,
      `<div class="address">`,
      `<a class="text-decoration-none" target="_blank"`,
      `href="https://maps.google.com/?q=${v.name}, ${v.address}, ${v.city}, ${v.state} ${v.zip}">`,
      `<p>`,
      `<i class="fa-solid fa-location-dot text-info"></i> `,
      `<span class="text-muted">`,
      `${v.address}, ${v.city}, ${v.state} ${v.zip} - ${v.phone}</span>`,
      `</p>`,
      `</a>`,
      `</div>`,
      `<div class="desc text-muted">`,
      `<i class="fa-solid fa-hospital"></i> `,
      `<span class="type">${v.hospital_type}</span>`,
      `<span class="ownership"><small>- ${v.hospital_ownership}</small></span>`,
      `</div>`,
      `<div class="desc text-muted">`,
      `<i class="fa-solid fa-truck-medical"></i> `,
      `<span class="attr">Emergency Service? </span>`,
      `<span class="val">`,
    ];

    if (v.emergency_services == "True") {
      row.push(`<i class="fa-solid fa-check text-success"></i>`);
    } else {
      row.push(`<i class="fa-solid fa-xmark text-danger"></i>`);
    }
    row = [
      ...row,
      `</span>`,
      // `</div>`,
      // `<div class="desc text-muted">`,
      ` - ${v.beds} <i class="fa-solid fa-bed-pulse"></i>`,
      `</div>`,
      `<div class="desc text-muted">`,
      `<span class="price"`,
      `><i class="fa-solid fa-tags"></i> Historical Price: ${currencyFormatter.format(
        v.price
      )}</span> `,
      `<i class="fa-sharp fa-solid fa-arrow-up text-danger"></i> `,
      `Compare to recommended price: ${currencyFormatter.format(
        v.predicted
      )}</span>`,
      `</div>`,
      `</div>`,
      `</div>`,
    ];

    console.log(row);
    res.append($(row.join("")));
    counter++;
    if (counter >= 5) {
      break;
    }
  }
};

// <div class="result-row row border-bottom p-1 m-1">
// <div class="hospital p-1">
//   <div class="name h5">METHODIST HOSPITAL UNION COUNTY</div>
//   <div class="rating">
//     <span class="val">
//       <span class="fa fa-star checked"></span>
//       <span class="fa fa-star checked"></span>
//       <span class="fa fa-star checked"></span>
//       <span class="fa fa-star"></span>
//       <span class="fa fa-star"></span>
//     </span>
//   </div>
//   <div class="address">
//     <a
//       class="text-decoration-none"
//       target="_blank"
//       href="https://maps.google.com/?q=METHODIST HOSPITAL UNION COUNTY,4604 US HIGHWAY 60 WEST,MORGANFIELD,Kentucky, KY, 42437"
//     >
//       <p>
//         <i class="fa-solid fa-location-dot text-info"></i>
//         <span class="text-muted"
//           >4604 US HIGHWAY 60 WEST, MORGANFIELD, KY 42437 - (123)
//           456-789
//         </span>
//       </p>
//     </a>
//   </div>

//   <div class="desc text-muted">
//     <i class="fa-solid fa-hospital"></i>
//     <span class="type">Critical Access Hospitals</span>
//     <span class="ownership"
//       ><small>- Voluntary non-profit - Church</small></span
//     >
//   </div>
//   <div class="desc text-muted">
//     <i class="fa-solid fa-truck-medical"></i>
//     <span class="attr">Emergency Service?</span>
//     <span class="val">
//       <i class="fa-solid fa-check text-success"></i>
//       <!-- <i class="fa-solid fa-xmark text-danger"></i> -->
//     </span>
//      -  234 <i class="fa-solid fa-bed-pulse"></i>
//   </div>
//   <div class="desc text-muted">
//   </div>
//   <div class="desc text-muted">
//     <span class="price"
//       ><i class="fa-solid fa-tags"></i> Historical Price:
//       $454.79</span
//     >
//     <i class="fa-sharp fa-solid fa-arrow-up text-danger"></i>

//     Compared to reference price:
//       $254.79</span
//     >
//   </div>
// </div>
// </div>
