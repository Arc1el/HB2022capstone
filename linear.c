#include<stdio.h>
#include<conio.h>
int main()
{
	int xo,x1; /* 초기값 설정 */
	int a,c,m;
	int i,n;
	int array[20];
	
	printf("xo 값 입력: ");
	scanf("%d",&xo);
	printf("\n");
	
	printf("a 값 입력: ");
	scanf("%d",&a);
	printf("\n");
	
	printf("c 값 입력: ");
	scanf("%d",&c);
	printf("\n");	
	 
	printf("m 값 입력: ");
	scanf("%d",&m);
	printf("\n");
	
	printf("생성하고자 하는 난수의 갯수를 입력: ");
	scanf("%d",&n);
	printf("\n");				
	
	for(i=0;i<n;i++)
	{
		x1=(a*xo+c) %m;
		array[i]=x1;
		xo=x1;
		
	}
	
	
	printf("생성된 난수: ");
	for(i=0;i<n;i++)
	{
		printf("%d",array[i]);
		printf("\t");
	}
	
	getch();
	return(0);
	
}