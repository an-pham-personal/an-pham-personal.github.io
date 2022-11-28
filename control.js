var db;
var labels = {
  categories: "Category",
  "hospital-types": "Hospital Type",
  "hospital-ownerships": "Hospital Ownership",
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
  console.log(categories);
  return [categories, hospitalType, hospitalOwnership];
};

init().then((data) => {
  console.log(data);
  const [categories, hospitalType, hospitalOwnership] = data;
  setupDropdown("categories", categories);
  setupDropdown("hospital-types", hospitalType);
  setupDropdown("hospital-ownerships", hospitalOwnership);
  console.log(db);
});

const setupDropdown = (id, data) => {
  const p = document.getElementById("control");
  const ctrl = document.createElement("div");
  ctrl.id = `${id}-control`;

  const lb = document.createElement("label");
  lb.htmlFor = id;
  lb.innerHTML = labels[id];

  ctrl.appendChild(lb);

  const s = document.createElement("select");
  s.name = id;
  s.id = id;

  ctrl.append(s);
  p.appendChild(ctrl);

  for (let d of data) {
    let opt = document.createElement("option");
    opt.value = d[0];
    opt.text = d[1];
    s.appendChild(opt);
  }
};
