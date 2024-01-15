import csv
from pablo_app.__init__ import Creator, Work, User, Comment, Like, db, app

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

    with open('users.csv', newline='', encoding='utf-8') as csv_users:
        reader = csv.reader(csv_users)
        next(reader)
        for row in reader:
            user = User(name=row[1])
            db.session.add(user)

    with open('comments.csv', newline='', encoding='utf-8') as csv_comments:
        reader = csv.reader(csv_comments)
        next(reader)
        for row in reader:
            comment = Comment(user_id=row[1], work_id=row[2], comment=row[3])
            db.session.add(comment)

    with open('likes.csv', newline='', encoding='utf-8') as csv_comments:
        reader = csv.reader(csv_comments)
        next(reader)
        for row in reader:
            like = Like(user_id=row[1], comment_id=row[2])
            db.session.add(like)

    db.session.commit()
    