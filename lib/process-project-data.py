import sqlite3 as s
import csv

conn = s.connect('project.db')
cur = conn.cursor()

with open('data-853.csv', 'r') as f:
    dr = csv.DictReader(f)
    for row in dr:
        # print(row, row['Address'], row['city'], row['state'], row['phone'])
        # print(row['payer'], type(row['payer']))
        cur.execute('INSERT OR IGNORE INTO payer (kind) values (?);', (row['payer'],))
        cur.execute('INSERT OR IGNORE INTO category (name) values (?);', (row['category'],))
        cur.execute('INSERT OR IGNORE INTO descr (short) values (?);', (row['short_description'],))
        cur.execute('INSERT OR IGNORE INTO hospital_type (kind) values (?);', (row['hospital_type'],))
        cur.execute('INSERT OR IGNORE INTO hospital_ownership (kind) values (?);', (row['hospital_ownership'],))
        cur.execute('INSERT OR IGNORE INTO hospital (name, address, city, state, phone) values (?, ?, ?, ?, ?);', 
        (row['name'], row['Address'], row['city'], row['state'], row['phone']))
        sql = f'''
        INSERT INTO main (
            payer_id, price, predicted, hospital_id, zip, beds, emergency_services,
            hospital_rating, category_id, descr_id, hospital_type_id, hospital_ownership_id
        )

        SELECT p.id, '{row["price"]}', '{row["prediction"]}', h.id, {row['zip']}, {row['beds']},
            '{row["emergency_services"].upper() == "YES"}', '{row["hospital_rating"]}', c.id, d.id, ht.id, ho.id
        FROM payer p, category c, descr d, hospital_type ht, hospital_ownership ho, hospital h
        WHERE p.kind = ? and c.name = ? and d.short = ? and ht.kind = ? and ho.kind = ? and h.name = ?
        '''
        # print(row, sql)
        cur.execute(sql, (row["payer"], row["category"], row["short_description"], \
                          row["hospital_type"], row["hospital_ownership"], row["name"],))
        conn.commit()

conn.close()

# create table payer (id integer primary key autoincrement, kind text);
# create unique index uniq_payer on payer(kind);
# create table category (id integer primary key autoincrement, name text);
# create unique index uniq_category on category(name);
# create table descr (id integer primary key autoincrement, short text);
# create table hospital_type (id integer primary key autoincrement, kind text);
# create table hospital_ownership (id integer primary key autoincrement, kind text);
# create unique index uniq_descr on descr(short);
# create unique index uniq_type on hospital_type(kind);
# create unique index uniq_ownership on hospital_ownership(kind);
# create table hospital (id integer primary key autoincrement, name text);
# create unique index uniq_hospital on hospital(name);
# 
# create table main (
#     id integer primary key autoincrement, 
#     payer_id int,
#     price int,
#     predicted int,
#     hospital_id,
#     zip text,
#     beds int,
#     emergency_services bool,
#     hospital_rating int,
#     category_id int,
#     descr_id int,
#     hospital_type_id int,
#     hospital_ownership_id int, 
#     foreign key (payer_id) references payer(id),
#     foreign key (category_id) references category(id),
#     foreign key (descr_id) references descr(id),
#     foreign key (hospital_type_id) references hospital_type(id),
#     foreign key (hospital_ownership_id) references hospital_ownership(id)
# );
# alter table hospital add column address text;
# alter table hospital add column city text;
# alter table hospital add column state text;
# alter table hospital add column phone text;
 
