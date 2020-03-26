% Script for calculating CU, WEC and CEC for an IES file

pathFileName = 'troffer.ies'; % 'ConfRoomFixture.ies', 'cosineDownLight.ies'

Length = 6.60; % meters
Width = 4.84;
Height = 2.795; % 1.675;
Awalls = 2*Height *(Length + Width);
Aceiling = (Length*Width);
Afloor = (Length*Width);

rho1 = 0.50; % Walls
rho2 = 0.80; % Ceiling
rho3 = 0.20;  % Floor

numFixtures = 4; % Number of lighting fixtures
fixtureEfficiency = 1.0;

CR = 5*Height*(Length+Width)/(Length*Width); % Cavity ratio (also denoted as m)
CRTable = 0:10;
f23Table = [1.0,0.827,0.689,0.579,0.489,0.415,0.355,0.306,0.265,0.231,0.202];
f23 = interp1(CRTable,f23Table,CR,'linear',nan);

[I,thetas,phis] = readIESFunction(pathFileName);
Iavg = mean(I,2); % Assume rotationally symmetric distribution. OK for calculating flux on walls, floor, ceiling.
zoneAngles = (5:10:85);
Iz = interp1(thetas,Iavg,zoneAngles,'linear',nan);
ZC = zeros(size(zoneAngles));
halfZone = (zoneAngles(2)-zoneAngles(1))/2;
for i1 = 1:length(zoneAngles)
    ZC(i1) = 2*pi*(cos((zoneAngles(i1)-halfZone)*pi/180)-cos((zoneAngles(i1)+halfZone)*pi/180)); % zonal constants are not centered on intensity readings
end
qup = find(zoneAngles>90&zoneAngles<180);
qdn = find(zoneAngles>0&zoneAngles<90);
totalFlux = sum(ZC.*Iz)/fixtureEfficiency;
etaD = sum(ZC(qdn).*Iz(qdn))/totalFlux;
etaU = sum(ZC(qup).*Iz(qup))/totalFlux;
kA = [0,0.041,0.070,0.100,0.136,0.190,0.315,0.640,2.10];
kB = [0,0.98,1.05,1.12,1.16,1.25,1.25,1.25,0.80];
kAi = interp1(zoneAngles(1:9),kA,zoneAngles(qdn),'linear',0.0);
kBi = interp1(zoneAngles(1:9),kB,zoneAngles(qdn),'linear',0.0);
km = exp(-kAi.*CR.^kBi); % CR is labeled "m" in book
Dm = sum(km.*ZC(qdn).*Iz(qdn))/(etaD*totalFlux);

C1 = (1-rho1)*(1-f23^2)/(2.5/CR*rho1*(1-f23^2)+f23*(1-rho1));
C2 = (1-rho2)*(1+f23)/(1+rho2*f23);
C3 = (1-rho3)*(1+f23)/(1+rho3*f23);
C0 = C1 + C2 + C3;

CU = (2.5*rho1*etaD*(1-Dm)*C1*C3)/(CR*(1-rho1)*(1-rho3)*C0) + ...
    (rho2*etaU*C2*C3)/((1-rho2)*(1-rho3)*C0) + ...
    Dm*etaD/(1-rho3)*(1-(rho3*C3*(C1+C2))/(C0*(1-rho3)))

WEC = 2.5/CR*(rho1*(1-Dm)*etaD/(1-rho1)*(1-(2.5*rho1*C1*(C2+C3)/(CR*(1-rho1)*C0))) + ...
    rho1*rho2*etaU*C1*C2/((1-rho1)*(1-rho2)*C0) + ...
    rho1*rho3*Dm*etaD*C1*C3/((1-rho1)*(1-rho3)*C0))

CEC = 2.5*rho1*rho2*(1-Dm)*etaD*C1*C2/(CR*(1-rho1)*(1-rho2)*C0) + ...
    rho2*etaU/(1-rho2)*(1-rho2*C2*(C1+C3)/((1-rho2)*C0)) + ...
    rho2*rho3*Dm*etaD*C2*C3/((1-rho2)*(1-rho3)*C0)

WallExitance = WEC*totalFlux*numFixtures/Afloor
CeilingExitance = CEC*totalFlux*numFixtures/Afloor
FloorExitance = CU*totalFlux*numFixtures*rho3/Afloor
MRSE = (WallExitance*Awalls + CeilingExitance*Aceiling + FloorExitance*Afloor)/(Awalls+Aceiling+Afloor)
