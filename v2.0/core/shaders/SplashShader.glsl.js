export default /* glsl */`
#ifdef GL_ES
precision highp float;
#endif

#define M_PI 3.1415926535897932384626433832795
#define M_PI_2 M_PI/2.0
#define M_PI_4 M_PI/4.0

uniform float u_time;
uniform vec2 u_mouse;

varying vec2 v_uv;

#define mouse vec2(sin(u_time)/48., cos(u_time)/48.)
#define iterations 14
#define formuparam2 0.79
 
#define volsteps 5
#define stepsize 0.390
 
#define zoom 0.900
#define tile   0.850
#define speed2  0.0 
#define brightness 0.003
#define darkmatter 0.400
#define distfading 0.560
#define saturation 0.800


#define transverseSpeed zoom*2.0
#define cloud 0.11 

 
float triangle(float x, float a) { 
	float output2 = 2.0*abs(  2.0*  ( (x/a) - floor( (x/a) + 0.5) ) ) - 1.0;
	return output2;
}
 
float field(in vec3 p, float time) {	
	float strength = 7. + .03 * log(1.e-6 + fract(sin(time) * 4373.11));
	float accum = 0.;
	float prev = 0.;
	float tw = 0.;	

	//for (int i = 0; i < 1; ++i) {
		float mag = dot(p, p);
		p = abs(p) / mag + vec3(-.5, -.8 + 0.1*sin(time*0.7 + 2.0), -1.1+0.3*cos(time*0.3));
		float w = exp(-float(0) / 7.);
		accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
		tw += w;
		prev = mag;
	//}
	return max(0., 5. * accum / tw - .7);
}

void main() {   
	float x = 2.0*v_uv.x - 1.0;
	float y = 2.0*v_uv.y - 1.0;
	float time2 = u_time / 40.0;
    float speed = 0.01 * cos( time2 + M_PI_4 );          
	vec2 uv = vec2(x,y);
	float a_xz = 0.9;
	float a_yz = -.6;
	float a_xy = 0.9 + time2*0.08;	
	mat2 rot_xz = mat2(cos(a_xz),sin(a_xz),-sin(a_xz),cos(a_xz));	
	mat2 rot_yz = mat2(cos(a_yz),sin(a_yz),-sin(a_yz),cos(a_yz));		
	mat2 rot_xy = mat2(cos(a_xy),sin(a_xy),-sin(a_xy),cos(a_xy));
	float v2 =1.0;
	vec3 dir=vec3(uv*zoom,1.);
	vec3 from=vec3(0.0, 0.0, 0.0);
	// from.x -= 0.1*(u_mouse.x-0.5);
	// from.y -= 0.1*(u_mouse.y-0.5);
	vec3 forward = vec3(0.,0.,1.);   
	from.x += transverseSpeed*(1.0)*cos(0.01*time2) + 0.001*time2;
	from.y += transverseSpeed*(1.0)*sin(0.01*time2) +0.001*time2;
	from.z += 0.003*time2;
	dir.xy*=rot_xy;
	forward.xy *= rot_xy;
	dir.xz*=rot_xz;
	forward.xz *= rot_xz;	
	dir.yz*= rot_yz;
	forward.yz *= rot_yz;
	from.xy*=-rot_xy;
	from.xz*=rot_xz;
	from.yz*= rot_yz;
	float zooom = 1.0;
	from += forward* zooom;
	float sampleShift = mod( zooom, stepsize );
	float zoffset = -sampleShift;
	sampleShift /= stepsize;
	float s=0.24;
	float s3 = s + stepsize/2.0;
	vec3 v=vec3(0.);
	float t3 = 0.0;	
	vec3 backCol2 = vec3(0.);
	for (int r=0; r<volsteps; r++) {
		vec3 p2=from+(s+zoffset)*dir;
		vec3 p3=from+(s3+zoffset)*dir;
		p2 = abs(vec3(tile)-mod(p2,vec3(tile*2.)));
		p3 = abs(vec3(tile)-mod(p3,vec3(tile*2.)));		
		#ifdef cloud
		t3 = field(p3, time2);
		#endif
		float pa,a=pa=0.;
		for (int i=0; i<iterations; i++) {
			p2=abs(p2)/dot(p2,p2)-formuparam2;
			float D = abs(length(p2)-pa);
			a += i > 7 ? min( 12., D) : D;
			pa=length(p2);
		}
		a*=a*a;
		float s1 = s+zoffset;
		float fade = pow(distfading,max(0.,float(r)-sampleShift));		
		v+=fade;
		if( r == 0 )
			fade *= (1. - (sampleShift));
		if( r == volsteps-1 )
			fade *= sampleShift;
		v+=vec3(s1,s1*s1,s1*s1*s1*s1)*a*brightness*fade;
		backCol2 += mix(.11, 1., v2) * vec3(1.8 * t3 * t3 * t3, 1.4 * t3 * t3, t3) * fade;
		s+=stepsize;
		s3 += stepsize;
	}
	v=mix(vec3(length(v)),v,saturation);
	vec4 forCol2 = vec4(v*.01,1.);	
	#ifdef cloud
	backCol2 *= cloud;
	#endif	
	backCol2.b *= 1.8;
	backCol2.r *= 0.05;
	backCol2.b = 0.5*mix(backCol2.g, backCol2.b, 0.8);
	backCol2.g = 0.0;
	backCol2.bg = mix(backCol2.gb, backCol2.bg, 0.5*(cos(time2*0.01) + 1.0));
	gl_FragColor = forCol2 + vec4(backCol2, 1.0);
}

`
;
