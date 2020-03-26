
function [I,thetas,phis] = readIESFunction(pathFileName)

fid = fopen(pathFileName,'r');
tiltLine = 0;
fileLine = '0';
while (~tiltLine && ~isempty(fileLine))
    fileLine = fgetl(fid);
    if (length(fileLine)>4)
        tiltLine = strcmp(fileLine(1:5),'TILT=');
        tilt = fileLine(6:end);
    end
end
if (~strcmp(tilt,'NONE'))
    error('TILT is not equal to "NONE." Exiting program.');
end

fileLine = fgetl(fid);
A = sscanf(fileLine,'%f%f%f%f%f%f%f%f%f%f');
numTheta = A(4);
numPhi = A(5);
for loop = 1:2
    fileLine = fgetl(fid);
end
thetas = sscanf(fileLine,'%f');
while length(thetas)<numTheta
    fileLine = fgetl(fid); % read values continued on next line
    thetas = [thetas;sscanf(fileLine,'%f')];
end
fileLine = fgetl(fid); % read first line of phi (azimuthal) values
phis = sscanf(fileLine,'%f');
while length(phis)<numPhi
    fileLine = fgetl(fid); % read values continued on next line
    phis = [phis;sscanf(fileLine,'%f')];
end

% Read array of intensity values
I = zeros(numTheta,numPhi);
for i1 = 1:numPhi
    fileLine = fgetl(fid);
    a = sscanf(fileLine,'%f');
    while length(a)<numTheta
        fileLine = fgetl(fid); % read values continued on next line
        a = [a;sscanf(fileLine,'%f')];
    end
    I(1:length(a),i1) = a;
end
fclose(fid);
%I = I/max(max(I))*28*1.844^2; % calibrate intensity in cd 

% Plot
thetaRad = thetas*pi/180;
polar(thetaRad,I(:,1))
%{
A = zeros(37,12);
for i1 = 1:37
    for i2 = 1:12
        A(i1,i2) = B(i1+37*(i2-1));
    end
end
%}
% Plot
A = I;
Phi = phis;
Theta = thetas;
%Asub1 = A(find(Theta>=0,1,'first'):find(Theta<360,1,'last'),find(Phi>=0,1,'first'):find(Phi<180,1,'last'));

%a = Asub1/max(max(Asub1)); % normalize data (for relative plots)
%Phi = Phi(find(Phi>=0,1,'first'):find(Phi<180,1,'last'));
%Theta = Theta(find(Theta>=0,1,'first'):find(Theta<360,1,'last'));

A = [A,A(:,1)]; %add first column(0 deg) to end (360 deg) so plotting draws complete picture
Phi = [Phi;Phi(1)];

ni = length(Theta);
nj = length(Phi);
z = zeros(ni,nj);
x = zeros(ni,nj);
y = zeros(ni,nj);

for i = 1:ni
   for j = 1:nj
      z(i,j) = A(i,j)*cos(Theta(i)*pi/180);
      x(i,j) = A(i,j)*sin(Theta(i)*pi/180)*cos(Phi(j)*pi/180);
      y(i,j) = A(i,j)*sin(Theta(i)*pi/180)*sin(Phi(j)*pi/180);
   end
end

%Default View
figure(4)
h = surf(x,y,-z);
colormap([1 0 0])
%colormap([1 .3 .3])
axis equal
light('Position',[.5 1 .5])
light('Position',[.5 -1 .5])
material shiny
set(h,'AmbientStrength',.4,'FaceLighting','phong','DiffuseStrength' ,.5)
set(h,'SpecularStrength',1,'EdgeColor','none','FaceColor','interp','BackFaceLighting','lit')
%axis vis3d off
%axis([-1 1 -1 1 -1 .2])
view(142.5,30)
xlabel('x');ylabel('y');zlabel('z');
axis equal

% Polar Plot
Amax = max(max(A));
A = A/Amax;
n = floor(length(Phi)/2);
rho = [flipud((A(2:end,n)));(A(:,1))];
theta = [(flipud(-Theta(2:end)));Theta];

%rho = [fliplr((a(1:61,91))') (a(1:61,1))'];
%rho = [fliplr((a(1:46,91))') (a(1:46,1))'];
%rho = [fliplr((a(1:19,37))') (a(1:19,1))'];
%phi = [(fliplr(-phi)) (phi)];

x = rho .* cos(theta*pi/180);
y = rho .* sin(theta*pi/180);
figure(1)
h = plot(y,-x,'b'); % to rotate -90 degrees
axis equal
%axis([-1 1 -1 .2])
set(h,'LineWidth',2)
%
hold on
n = floor(length(Phi)/4);
rho = [flipud((A(2:end,n)));(A(:,round(3*n/4)))];
%rho = [fliplr((a(1:46,136))') (a(1:46,46))'];
%rho = [fliplr((a(1:19,55))') (a(1:19,18))'];
x = rho .* cos(theta*pi/180);
y = rho .* sin(theta*pi/180);
figure(1)
h = plot(y,-x,'c'); % x,y swapped to rotate -90 degrees
set(h,'LineWidth',2)
% plot cosine response
x = cos(theta*pi/180) .* cos(theta*pi/180);
y = cos(theta*pi/180) .* sin(theta*pi/180);
figure(1)
h = plot(y,-x,'r--'); % x,y swapped to rotate -90 degrees
legend('0 deg','90 deg','cosine dist.')


% *** draw scale ***
for i = 1:5
	s1 =  0.2*i;
	u1 = s1 .* cos(theta*pi/180);
	v1 = s1 .* sin(theta*pi/180);
   h2 = plot(v1,-u1,'k:');
   set(h2,'LineWidth',.25)
end
plot([-1 0 1],[0 0 0],'k') %x-axis
plot([0 0],[0 -1.2],'k:') %y-axis
plot([0 -cos(30*pi/180)],[0 -sin(30*pi/180)],'k:') % gridline
plot([0 -cos(60*pi/180)],[0 -sin(60*pi/180)],'k:') % gridline
plot([0 cos(60*pi/180)],[0 -sin(60*pi/180)],'k:') % gridline
plot([0 cos(30*pi/180)],[0 -sin(30*pi/180)],'k:') % gridline
axis off
text(0,-1.1,[num2str(Amax,'%.1f') ' cd']);
hold off
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%{
% Plotting horizontal cross sections(rho,theta 0 to 360) at different elevation angles(phi)
figure(2)
matrixRow = 10/2+1;%matrix has data every 2 degrees starting at 0 degrees
rho = [a(matrixRow,:) a(matrixRow,1)];
theta = 0:30:360;
theta = theta * pi/180;% convert to radians
x = rho .* (cos(theta));
y = rho .* (sin(theta));
h = plot(x,y,'k');
axis equal
axis([-1 1 -1 1])
set(h,'LineWidth',2)
hold on

matrixRow = 20/2+1;
rho = [a(matrixRow,:) a(matrixRow,1)];
theta = 0:30:360;
theta = theta * pi/180;% convert to radians
x = rho .* (cos(theta));
y = rho .* (sin(theta));
h = plot(x,y,'b');
axis equal
axis([-1 1 -1 1])
set(h,'LineWidth',2)
   
matrixRow = 30/2+1;
rho = [a(matrixRow,:) a(matrixRow,1)];
theta = 0:30:360;
theta = theta * pi/180;% convert to radians
x = rho .* (cos(theta));
y = rho .* (sin(theta));
h = plot(x,y,'c');
axis equal
axis([-1 1 -1 1])
set(h,'LineWidth',2)

matrixRow = 60/2+1;
rho = [a(matrixRow,:) a(matrixRow,1)];
theta = 0:30:360;
theta = theta * pi/180;% convert to radians
x = rho .* (cos(theta));
y = rho .* (sin(theta));
h = plot(x,y,'m');
axis equal
axis([-1 1 -1 1])
set(h,'LineWidth',2)
legend('10 deg','20 deg','30 deg','60 deg')

% *** draw scale ***
for i = 1:5
	s1 =  0.2*i;
	u1 = s1 .* cos(theta);
	v1 = s1 .* sin(theta);
   h2 = plot(u1,v1,'k:');
   set(h2,'LineWidth',.25)
end
plot([-1 0 1],[0 0 0],'k') %x-axis
plot([0 0 0],[1 0 -1],'k:') %y-axis
plot([0 cos(30*pi/180)],[0 sin(30*pi/180)],'k:') % gridline
plot([0 cos(60*pi/180)],[0 sin(60*pi/180)],'k:') % gridline
plot([0 cos(120*pi/180)],[0 sin(120*pi/180)],'k:') % gridline
plot([0 cos(150*pi/180)],[0 sin(150*pi/180)],'k:') % gridline
plot([0 cos(210*pi/180)],[0 sin(210*pi/180)],'k:') % gridline
plot([0 cos(240*pi/180)],[0 sin(240*pi/180)],'k:') % gridline
plot([0 cos(300*pi/180)],[0 sin(300*pi/180)],'k:') % gridline
plot([0 cos(330*pi/180)],[0 sin(330*pi/180)],'k:') % gridline
axis off

%}
