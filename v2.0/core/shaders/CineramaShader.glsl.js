export default /* glsl */`

#define M_PI 3.1415926535897932384626433832795
#define M_PI_2 M_PI/2.0
#define M_PI_4 M_PI/4.0
#define M_S2 0.7071067811865475

uniform sampler2D u_image;
uniform sampler2D u_skin;
uniform float u_factor;
uniform float u_flexture;

varying vec2 v_uv;
float s=1.0;

void main() {
  vec4 color = vec4(0.0, 0.0, 0.0, 1.0);

  float x = 2.0*v_uv.x - 1.0;
  float y = 2.0*v_uv.y - 1.0;
  float r = sqrt(x*x+y*y);
  float l = r*u_factor;

  if ( l<=1.0 )
  { 
    float a = atan( y, -x);
    float b = M_PI*l;
    float yd = cos(b);
    float rd = sin(b);
    float xd = rd*sin(a);
    float zd = rd*cos(a);
    float m = (a/M_PI+1.0)/2.0;

    float ys = yd/zd;
    float xs1 = (xd/zd+1.0)/2.0;
    float xs2 = (xd/M_S2+1.0)/2.0;
    float xs = xs1*(1.0-u_flexture)+xs2*u_flexture;

    if( ys>0.0 && ys<1.0 && xs>0.0 && xs<1.0 && zd>0.0 ) {
      vec2 r_uv = vec2( xs, ys );
      color = texture2D(u_image, r_uv);
    } else {
      float xp = (l*sin(a)+1.0)/2.0;
      float yp = (-l*cos(a)+1.0)/2.0;
      vec2 r_uv = vec2( xp, yp );
      color = texture2D(u_skin, r_uv);
    }
  }
  gl_FragColor = color;
}
`;