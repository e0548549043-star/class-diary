const BASE_URL = import.meta.env.VITE_API_URL as string;


type Method = 'GET' | 'POST' | 'PUT' | 'PATCH';
type Query = Record<string, string | number | undefined>;

type RequestOptions={
    method?:Method,
    body?:unknown,
    query?:Query
}

type FieldError={
    field:string,
    message:string
}

type ErrorBody={
    error:{message:string,
           code:string,
           details?:FieldError[]
    }
    
}

export class ApiError extends Error{
    status:number;
    code:string;
    details:FieldError[];

    constructor(status:number,code:string,message:string,details:FieldError[]=[]){
      super(message) 
      this.status=status;
      this.code=code;
      this.details=details; 
    }
}
export const saveToken=(token:string)=>sessionStorage.setItem('token',token)

export const getToken=()=>sessionStorage.getItem('token')

export const clearToken=()=>sessionStorage.removeItem('token')


async function request<T>(path:string, options:RequestOptions={}) : Promise<T>{
const {method='GET',body,query} =options;
let url=BASE_URL+path
if(query){
    const params=new URLSearchParams();
    for( const[Key,val] of Object.entries(query)){
          if(val!==undefined&&val!=="")
            params.append(Key,String(val))    
    }
 if(params.toString())
    url+='?'+params;
}
const headers:Record<string,string>={};
if(body !== undefined){
    headers["Content-Type"]="application/json"
}
const token=getToken();
if(token){
    headers['Authorization']=`Bearer ${token}`
}


let response:Response;

try{
 response=await fetch(url,{method,headers,body: options.body !== undefined ? JSON.stringify(options.body) : undefined})   
}
catch{
     throw new ApiError(0,"NetworkError","אין חיבור לשרת נסה שוב מאוחר יותר")
}
if(!response.ok){
    let data:ErrorBody | undefined
    try{
       data= await response.json()
    }
    catch{}
    if(response.status===401){
        clearToken();
    }
    throw new ApiError(response.status,data?.error?.code ?? "UNKNOWERROR",data?.error?.message ?? "ארע שגיאה",data?.error?.details);   
}
return response.json() as Promise<T>
}
export default request;