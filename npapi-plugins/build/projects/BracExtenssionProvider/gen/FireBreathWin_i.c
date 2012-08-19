

/* this ALWAYS GENERATED file contains the IIDs and CLSIDs */

/* link this file in with the server and any clients */


 /* File created by MIDL compiler version 7.00.0555 */
/* at Sat Aug 18 14:50:36 2012
 */
/* Compiler settings for D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/projects/BracExtenssionProvider/gen/FireBreathWin.idl:
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

MIDL_DEFINE_GUID(IID, LIBID_BracExtenssionProviderLib,0x7d02cd29,0x3406,0x5c7b,0x89,0x19,0xb2,0xe3,0x02,0xe6,0x39,0x69);


MIDL_DEFINE_GUID(IID, IID_IFBControl,0x6a2715b0,0x2865,0x5d59,0x87,0xb0,0xa8,0x36,0x8a,0x82,0x4b,0x7a);


MIDL_DEFINE_GUID(IID, IID_IFBComJavascriptObject,0x4832bb9a,0xf5c2,0x5428,0xa2,0x7c,0xe9,0xa6,0x52,0xca,0x11,0xda);


MIDL_DEFINE_GUID(IID, DIID_IFBComEventSource,0xb66cede7,0x29cd,0x5458,0x8f,0xdb,0xbb,0xf5,0x0b,0x07,0x66,0xde);


MIDL_DEFINE_GUID(CLSID, CLSID_FBControl0,0xf4949555,0x610e,0x5bb5,0x99,0x25,0x6e,0x8f,0x16,0xea,0x15,0x08);


MIDL_DEFINE_GUID(CLSID, CLSID_FBComJavascriptObject,0x2e9e6362,0x69be,0x547e,0x83,0x9c,0x14,0xea,0xbc,0x55,0xd6,0x94);

#undef MIDL_DEFINE_GUID

#ifdef __cplusplus
}
#endif



