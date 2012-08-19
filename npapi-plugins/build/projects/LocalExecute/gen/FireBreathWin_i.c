

/* this ALWAYS GENERATED file contains the IIDs and CLSIDs */

/* link this file in with the server and any clients */


 /* File created by MIDL compiler version 7.00.0555 */
/* at Sat Jun 23 11:42:36 2012
 */
/* Compiler settings for D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/projects/LocalExecute/gen/FireBreathWin.idl:
    Oicf, W1, Zp8, env=Win32 (32b run), target_arch=X86 7.00.0555 
    protocol : dce , ms_ext, c_ext, robust
    error checks: allocation ref bounds_check enum stub_data 
    VC __declspec() decoration level: 
         __declspec(uuid()), __declspec(selectany), __declspec(novtable)
         DECLSPEC_UUID(), MIDL_INTERFACE()
*/
/* @@MIDL_FILE_HEADING(  ) */

#pragma warning( disable: 4049 )  /* more than 64k source lines */


#ifdef __cplusplus
extern "C"{
#endif 


#include <rpc.h>
#include <rpcndr.h>

#ifdef _MIDL_USE_GUIDDEF_

#ifndef INITGUID
#define INITGUID
#include <guiddef.h>
#undef INITGUID
#else
#include <guiddef.h>
#endif

#define MIDL_DEFINE_GUID(type,name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8) \
        DEFINE_GUID(name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8)

#else // !_MIDL_USE_GUIDDEF_

#ifndef __IID_DEFINED__
#define __IID_DEFINED__

typedef struct _IID
{
    unsigned long x;
    unsigned short s1;
    unsigned short s2;
    unsigned char  c[8];
} IID;

#endif // __IID_DEFINED__

#ifndef CLSID_DEFINED
#define CLSID_DEFINED
typedef IID CLSID;
#endif // CLSID_DEFINED

#define MIDL_DEFINE_GUID(type,name,l,w1,w2,b1,b2,b3,b4,b5,b6,b7,b8) \
        const type name = {l,w1,w2,{b1,b2,b3,b4,b5,b6,b7,b8}}

#endif !_MIDL_USE_GUIDDEF_

MIDL_DEFINE_GUID(IID, LIBID_LocalExecuteLib,0xc996b115,0x2f98,0x5f1e,0x99,0x4a,0x19,0x5b,0x32,0x82,0x25,0x16);


MIDL_DEFINE_GUID(IID, IID_IFBControl,0x06281b89,0x717f,0x50d7,0x83,0x53,0x1e,0x52,0x2b,0x27,0x0d,0x29);


MIDL_DEFINE_GUID(IID, IID_IFBComJavascriptObject,0x07aaa881,0x095b,0x5e4f,0xb7,0x9d,0xac,0x0b,0x65,0xce,0x29,0x42);


MIDL_DEFINE_GUID(IID, DIID_IFBComEventSource,0xa98661a7,0x5997,0x5706,0xa9,0x0a,0xfa,0x80,0xae,0x06,0xfd,0x93);


MIDL_DEFINE_GUID(CLSID, CLSID_FBControl0,0x0d3e8f9c,0xc52d,0x5091,0x88,0x52,0x3c,0xc8,0x9b,0xa7,0xcf,0xe5);


MIDL_DEFINE_GUID(CLSID, CLSID_FBComJavascriptObject,0x47f26c51,0x67c8,0x50ee,0x98,0x1b,0x97,0x03,0x9f,0x7c,0x5d,0x13);

#undef MIDL_DEFINE_GUID

#ifdef __cplusplus
}
#endif



