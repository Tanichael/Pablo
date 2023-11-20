import csv
from pablo_app.__init__ import Creator, Work, db, app

with app.app_context():
    db.create_all()

    with open('works.csv', newline='', encoding='utf-8') as csv_works:
        reader = csv.reader(csv_works)
        next(reader)
        for row in reader:
            work = Work(title=row[1], creator_id=row[2], description=row[3])
            db.session.add(work)

    with open('creators.csv', newline='', encoding='utf-8') as csv_creators:
        reader = csv.reader(csv_creators)
        next(reader)
        for row in reader:
            creator = Creator(name=row[1])
            db.session.add(creator)

    db.session.commit()
    