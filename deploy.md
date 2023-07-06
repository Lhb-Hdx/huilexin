# 部署说明

* 修改.env文件，设置 VUE_APP_SYSTEM_NAME

* 服务器部署位置 /root/

    * itms-tomcat : IT智能运维系统；端口：818
    * idh-tomcat : 动环智能监控系统；端口：809
    * ivideo-tomcat : 视频监控系统；端口：801
    * iassets-tomcat : 资产管理系统；端口：未部署
    * 其它目录暂时没有使用，比如tomcat8已停用，迁移到ivideo-tomcat下面

    暂时没有使用ssl证书，由nginx的https --> tomcat的http



# dev project cmd 
    cnpm install 

    cnpm run dev
