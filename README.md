# CS425 - Computer Graphics I (Spring 2021)
# Dmitrieva Aleksandra

### Assignment 1: Triangle meshes rendering
This application to renders an urban setting described in an external JSON file that must be uploaded by the user through a configuration panel. 
The JSON file has four layers describing the elements and color of buildings, parks, water and surface of a particular region.
This image shows the 
To run the program: open on a local host

### Description: 
`Configuration panel` has four components: 
1) Rotate slider with values between 0 and 360. 
2) Zoom slider with value between 1 and 100. This slider approximates the camera towards the center point of the model. 
3) Dropdown menu with values *perspective* and *orthographic*. Changing the selected option will change the projection type.
4) A JSONfile input.The JSON file contains coordinates, indices, and colors for 4 layers (buildings, water, parks, surface).
![pannel.png](http://https://github.com/uic-cs425/spring-2021-assignment-1-aleksandrasv/blob/main/pannel.png)

The program contains four main classes:
- `FlatProgram`: handles shading of flat layers (water, parks, surface).These layers contains a constant color. 
- `BuildingProgram`: handles shading of building layer. This layer contains normals and a constant color.
- `Layer` and `BuildingLayer`: handles flat layers, and building layer.
- `Layers`: collection of layers.

A unique buffer and VAO is used for each layer. The color is unified for each layer. 

--------------------------------------------------------------------------------------------------------------------------------------
File `utils.js` contains some useful functions to create [shaders](https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader),
 [programs](https://developer.mozilla.org/en-US/docs/Web/API/WebGLProgram), 
 [buffers](https://developer.mozilla.org/en-US/docs/Web/API/WebGLBuffer),
 [VAOs](https://developer.mozilla.org/en-US/docs/Web/API/WebGLVertexArrayObject), 
 as well as 
 [matrix operations](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Matrix_math_for_the_web), 
 [projections](http://www.songho.ca/opengl/gl_projectionmatrix.html), 
 and 
 [lookat](https://www.khronos.org/registry/OpenGL-Refpages/gl2.1/xhtml/gluLookAt.xml).


#### JSON format

The building layer also contains normals for each vertex. You can download a zip file with a sample json [here](https://fmiranda.me/courses/cs425-spring-2021/city.json.zip).

The `coordinates` array consists of a list of all the vertices for that particular layer. 
The `indices` array contains the indices of the vertices used to render triangles via `glDrawElements`. 
That is, starting from the first element in the indices array, every three values correspond to indices of vertices that make a triangle in the triangle mesh.

```javascript
{
    'buildings': 
    {
        'coordinates': [x_1,y_1,z_1,x_2,y_2,z_2,...,x_n,y_n,z_n],
        'indices': [i_1,i_2,...,i_n],
        'normals': [x_1,y_1,z_1,x_2,y_2,z_2,...,x_n,y_n,z_n],
        'color': [r,g,b,a]
    },
    'water': 
    {
        'coordinates': [x_1,y_1,z_1,x_2,y_2,z_2,...,x_n,y_n,z_n],
        'indices': [i_1,i_2,...,i_n],
        'color': [r,g,b,a]
    },
    'parks': 
    {
        'coordinates': [x_1,y_1,z_1,x_2,y_2,z_2,...,x_n,y_n,z_n],
        'indices': [i_1,i_2,...,i_n],
        'color': [r,g,b,a]
    },
    'surface':
    {
        'coordinates': [x_1,y_1,z_1,x_2,y_2,z_2,...,x_n,y_n,z_n],
        'indices': [i_1,i_2,...,i_n],
        'color': [r,g,b,a]
    },
}
```
