/**
 * Created by lixuc on 2017/6/14.
 */
module.exports = {
    Video_Upload_Dir: process.env.Video_Upload_Dir || "/tmp",
    Second_Per_Capture: process.env.Second_Per_Capture || 5,
    AI_VISION_API: process.env.AI_VISION_API || "https://crl.ptopenlab.com:8800/dlaas/api",
    Context_Path: process.env.Context_Path || "/"
};
