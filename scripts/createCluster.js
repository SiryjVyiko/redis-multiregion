var regions = '${settings.regions}'.split(','), masterNodesString = "", createClusterCommand = "", resp, envInfo,
    getAnnounceIpCommand = "cat /etc/redis.conf|grep ^cluster-announce-ip|tail -n 1|awk '{print $2}'",
    rebalanceCommand = "export REDISCLI_AUTH=$(cat /etc/redis.conf |grep '^requirepass'|awk '{print $2}'); redis-cli --cluster check 127.0.0.1:6379 || redis-cli --cluster fix 127.0.0.1:6379; redis-cli --cluster rebalance 127.0.0.1:6379"
    targetMasterIdCommand = "export REDISCLI_AUTH=$(cat /etc/redis.conf |grep '^requirepass'|awk '{print $2}'); redis-cli cluster nodes|grep myself|awk '{print $1}'";    
for (var cluster = 1, n = regions.length + 1; cluster < n; cluster++) {
    envInfo = jelastic.env.control.GetEnvInfo('${settings.mainEnvName}-' + cluster, session);
    if (envInfo.result != 0) {
        return envInfo;
    }
    var resp = jelastic.env.control.ExecCmdById('${settings.mainEnvName}-' + cluster, session, envInfo.nodes[0].id, toJSON([{"command": getAnnounceIpCommand, "params": ""}]), false, "root");
    if (resp.result != 0) { return resp; }
    announceIp = resp.responses[0].out
    masterNodesString = masterNodesString + announceIp + ":6379 "
}
envInfo = jelastic.env.control.GetEnvInfo('${settings.mainEnvName}-1', session);
if (envInfo.result != 0) { return envInfo; }
createClusterCommand = "export REDISCLI_AUTH=$(cat /etc/redis.conf |grep '^requirepass'|awk '{print $2}'); redis-cli --cluster create  " + masterNodesString + " --cluster-replicas 0";
resp = jelastic.env.control.ExecCmdById('${settings.mainEnvName}-1', session, envInfo.nodes[0].id, toJSON([{"command": createClusterCommand, "params": ""}]), false, "root");
if (resp.result != 0) { return resp; }    

resp = jelastic.env.control.ExecCmdById('${settings.mainEnvName}-1', session, envInfo.nodes[0].id, toJSON([{"command": rebalanceCommand, "params": ""}]), false, "root");
if (resp.result != 0) { return resp; }    

return {
    result: 0
};
