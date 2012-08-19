# Install script for directory: D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath

# Set the install prefix
IF(NOT DEFINED CMAKE_INSTALL_PREFIX)
  SET(CMAKE_INSTALL_PREFIX "C:/Program Files (x86)/FireBreath")
ENDIF(NOT DEFINED CMAKE_INSTALL_PREFIX)
STRING(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
IF(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  IF(BUILD_TYPE)
    STRING(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  ELSE(BUILD_TYPE)
    SET(CMAKE_INSTALL_CONFIG_NAME "Release")
  ENDIF(BUILD_TYPE)
  MESSAGE(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
ENDIF(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)

# Set the component getting installed.
IF(NOT CMAKE_INSTALL_COMPONENT)
  IF(COMPONENT)
    MESSAGE(STATUS "Install component: \"${COMPONENT}\"")
    SET(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  ELSE(COMPONENT)
    SET(CMAKE_INSTALL_COMPONENT)
  ENDIF(COMPONENT)
ENDIF(NOT CMAKE_INSTALL_COMPONENT)

IF(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for each subdirectory.
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/cmake_common/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/boost/libs/thread/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/boost/libs/system/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/ScriptingCore/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/PluginCore/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/NpapiCore/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/ActiveXCore/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/projects/BracExtenssionProvider/PluginAuto/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/projects/BracExtenssionProvider/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/projects/LocalExecute/PluginAuto/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/projects/LocalExecute/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/unittest-cpp/UnitTest++/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/ScriptingCoreTest/cmake_install.cmake")
  INCLUDE("D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/ActiveXCoreTest/cmake_install.cmake")

ENDIF(NOT CMAKE_INSTALL_LOCAL_ONLY)

IF(CMAKE_INSTALL_COMPONENT)
  SET(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INSTALL_COMPONENT}.txt")
ELSE(CMAKE_INSTALL_COMPONENT)
  SET(CMAKE_INSTALL_MANIFEST "install_manifest.txt")
ENDIF(CMAKE_INSTALL_COMPONENT)

FILE(WRITE "D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/${CMAKE_INSTALL_MANIFEST}" "")
FOREACH(file ${CMAKE_INSTALL_MANIFEST_FILES})
  FILE(APPEND "D:/faham/tim/bric-n-brac/browser-ext/google-chrome/screenshot/firebreath/build/${CMAKE_INSTALL_MANIFEST}" "${file}\n")
ENDFOREACH(file)
