rs.initiate();

var cfg=rs.conf();

cfg.members[0].host="mongo-0.mongo:27017";

rs.add("mongo-1.mongo:27017");

rs.add("mongo-2.mongo:27017");

rs.reconfig(cfg, { force: true });

rs.status();


