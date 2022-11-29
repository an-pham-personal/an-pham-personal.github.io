// TODO add loading screen

var db;
var labels = {
  category: "Category",
  hospital_type: "Hospital Type",
  hospital_ownership: "Hospital Ownership",
  // payer: "Payer",
  hospital: "Hospital",
  descr: "Short Description",
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
    conds.push(`${k}_id = ${v}`);
  }

  sql = sql.join(" ");
  sql = `${sql} ${conds.join(" and ")}`;
  sql = `${sql} order by price desc`;
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
