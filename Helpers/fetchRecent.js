import History from "../Models/history.js"

export const getRecentHistory = async (taskIdArray) => {
    let historyArray = []
    let history = []
    for(let data of taskIdArray){
        let value = await History.find({ tasks: data }).sort({ createAt: 1 });
        historyArray.push(value)
    }
    // console.log(historyArray);
    for(let items of historyArray){
        for(let item of items){
            history.push(item)
        }
    }
    return history
}
