
create database blog_database;

use blog_database;

create table users(
	id INT auto_increment,
    username varchar(64) not null,
    email varchar(255) not null,
    hashPassword varchar(255) not null,
    createdAt datetime default current_timestamp,
    updatedAt datetime null,
	deletedAt datetime null,

    primary key (id),
    unique key (username, email)
);


create table categories (

    id INT auto_increment,
    name varchar(255) not null,
   
    createdAt datetime default current_timestamp,
    updatedAt datetime null,
	deletedAt datetime null,

    primary key (id),
    unique key (name)
);

create table posts (

    id INT auto_increment,
    userId INT,
    categoryId INT,
    body text not null,
   
    createdAt datetime default current_timestamp,
    updatedAt datetime null,
	deletedAt datetime null,

    foreign key (userId) references users(id),
    foreign key (categoryId) references categories(id),
    primary key (id)
);

create table comments (

    id INT auto_increment,
    userId INT,
    postId INT,
    body text not null,
   
    createdAt datetime default current_timestamp,
    updatedAt datetime null,
	deletedAt datetime null,

    foreign key (userId) references users(id),
    foreign key (postId) references posts(id),
    primary key (id)
);