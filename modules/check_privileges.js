/**
 * It checks if the user has the required privileges
 * @param endpoint - The Endpoint called check.
 * @param role - Role of User (req.session.user.role).
 * @param prüfstück - Wheather a prüfstück is concerned.
 * @param options - Optional data that can influence privileges.
 * @returns True if user has the required Privileges else returns false.
 */
let checkPrivileges = (endpoint, role, prüfstück=false, options=false) => {
    if(prüfstück==1)
        prüfstück=true;
    const admin="admin";
    const lehrerMedien = "lehrerMedien";
    const lehrer = "lehrer";
    const pruefer = "pruefer";
    const azubi = "azubi";
    switch(endpoint){
        case "/files/stream":
        case "/files/download":
        case "/films/get":
        case "/films/listFiles":
            if((!prüfstück && [admin, lehrerMedien, lehrer, azubi].indexOf(role)!==-1)
            || (prüfstück && [admin, pruefer].indexOf(role)!==-1))
                return true;
            break;

        case "/files/upload":
        case "/films/delete":
        case "/films/create":
        case "/films/update":
            if((!prüfstück && [admin, lehrerMedien].indexOf(role)!==-1)
            || (prüfstück && [admin, pruefer].indexOf(role)!==-1))
                return true;
            break;
        
        case "/users/get":
        case "/users/list":
        case "/users/delete":
            if([admin].indexOf(role)!==-1)
                return true;
            break;
        
        case "/users/updateRole":
            if([admin, lehrerMedien, lehrer].indexOf(role)!==-1 && options!==false && options.oldRole==null && options.newRole==azubi)
                return true;
            if([admin].indexOf(role)!==-1)
                return true;
            break;

        default:
            return false;
    }
    return false;
};

module.exports = {
    checkPrivileges
};
