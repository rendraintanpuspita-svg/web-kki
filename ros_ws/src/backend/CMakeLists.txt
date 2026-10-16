cmake_minimum_required(VERSION 3.8)
project(backend)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

# find dependencies
find_package(ament_cmake REQUIRED)
find_package(rclpy REQUIRED)
find_package(std_msgs REQUIRED)
find_package(rosidl_default_generators REQUIRED)

# custom msg
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/Gpsdata.msg"
  "msg/Motiondata.msg"
  DEPENDENCIES std_msgs
)

# Install Python executable
install(
  PROGRAMS
    src/data.py
    src/data2.py
    src/dummy_pub.py
    src/image.py
    src/gps.py
  DESTINATION lib/${PROJECT_NAME}
)

# Export Message Runtime
ament_export_dependencies(rosidl_default_runtime)

if(BUILD_TESTING)
  find_package(ament_lint_auto REQUIRED)
  set(ament_cmake_copyright_FOUND TRUE)
  set(ament_cmake_cpplint_FOUND TRUE)
  ament_lint_auto_find_test_dependencies()
endif()

ament_package()
