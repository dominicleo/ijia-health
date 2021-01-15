import * as React from 'react';

export default () => {
  // const { id } = useQuery<{ id: string }>();
  // const { safeArea } = getSystemInfoSync();
  // const safeAreaHeight = safeArea.bottom - safeArea.height;
  // // 页面数据加载状态
  // const [loaded, setPageCompleted] = React.useState(false);
  // const { data, error, loading, run } = useRequest(() => PrescriptionService.query(id), {
  //   onSuccess() {
  //     !loaded && setPageCompleted(true);
  //   },
  // });

  // if (error) {
  //   return (
  //     <PageResult
  //       type='empty-record'
  //       message={error.message}
  //       buttonText='重新加载'
  //       buttonClick={run}
  //       buttonProps={{
  //         loading,
  //         disabled: loading,
  //       }}
  //     />
  //   );
  // }

  // if (!loaded) {
  //   return (
  //     <View className={s.wrapper}>
  //       <View className={s.loader}>
  //         <Skeleton title row={16} />
  //       </View>
  //     </View>
  //   );
  // }

  // const {
  //   medicalInsCode,
  //   prescriptionNo,
  //   prescriptions,
  //   hospitalName,
  //   userinfo,
  //   appeal,
  //   conclusion,
  //   doctor,
  //   reviewer,
  //   dispather,
  //   seal,
  //   tips,
  //   createdAt,
  // } = data || {};

  // return (
  //   <View className={s.wrapper}>
  //     <View className={classnames(s.prescription, { [s.invalid]: true })}>
  //       <View className={s.hospitalName}>{hospitalName}</View>
  //       <View className={s.categoryName}>电子处方笺</View>
  //       <View className={s.prescriptionNo}>NO.{prescriptionNo}</View>
  //       <View className={s.code}>医疗机构编码：{medicalInsCode}</View>
  //       <View className={s.userinfo}>
  //         <View className={s.userinfoItem}>
  //           <View>姓名</View>
  //           <View>{userinfo?.name}</View>
  //         </View>
  //         <View className={s.userinfoItem}>
  //           <View>性别</View>
  //           <View>{userinfo?.gender}</View>
  //         </View>
  //         <View className={s.userinfoItem}>
  //           <View>年龄</View>
  //           <View>{userinfo?.age}</View>
  //         </View>
  //         <View className={s.userinfoItem}>
  //           <View>过敏史</View>
  //           <View>{userinfo?.historyOfAllergies || '无'}</View>
  //         </View>
  //       </View>
  //       <View>
  //         <View className={s.appealConclusion}>
  //           <View className={s.title}>主诉：</View>
  //           <View className={s.content}>{appeal}</View>
  //         </View>
  //         <View className={s.appealConclusion}>
  //           <View className={s.title}>诊断：</View>
  //           <View className={s.content}>{conclusion}</View>
  //         </View>
  //       </View>
  //       <View className={s.prescriptionList}>
  //         <View className={s.title}>Rp：</View>
  //         <View>
  //           {Array.isArray(prescriptions) &&
  //             prescriptions.map(({ id, name, instructions, count, unit }) => (
  //               <View key={id} className={s.prescriptioItem}>
  //                 <View>
  //                   <View className={s.name}>{name} </View>
  //                   <Text>{instructions}</Text>
  //                 </View>
  //                 <View className={s.amount}>
  //                   {count}
  //                   {unit}
  //                 </View>
  //               </View>
  //             ))}
  //         </View>
  //       </View>
  //     </View>

  //     <View className={classnames(s.pharmacist, { [s.invalid]: true })}>
  //       {seal && <View className={s.officialSeal} style={{ backgroundImage: `url(${seal})` }} />}
  //       <View className={s.pharmacistList}>
  //         <View className={s.pharmacistItem}>
  //           <View>处方药师</View>
  //           {doctor?.signatureImageUrl ? (
  //             <View
  //               className={s.autograph}
  //               style={{ backgroundImage: `url(${doctor.signatureImageUrl})` }}
  //             />
  //           ) : (
  //             <View>{doctor?.name}</View>
  //           )}
  //         </View>
  //         <View className={s.pharmacistItem}>
  //           <View>审核药师</View>
  //           {reviewer?.signatureImageUrl ? (
  //             <View
  //               className={s.autograph}
  //               style={{ backgroundImage: `url(${reviewer.signatureImageUrl})` }}
  //             />
  //           ) : (
  //             <View>{reviewer?.name}</View>
  //           )}
  //         </View>
  //         <View className={s.pharmacistItem}>
  //           <View>发药药师</View>
  //           {dispather?.signatureImageUrl ? (
  //             <View
  //               className={s.autograph}
  //               style={{ backgroundImage: `url(${dispather.signatureImageUrl})` }}
  //             />
  //           ) : (
  //             <View>{dispather?.name}</View>
  //           )}
  //         </View>
  //       </View>
  //       <View className={s.date}>开方时间：{dayjs(createdAt).format('lll')}</View>
  //       <View className={s.tips}>
  //         <View>特别提示</View>
  //         <RichText nodes={html2nodes(tips || '')} />
  //       </View>
  //     </View>
  //     <View className={s.toolbar} style={{ paddingTop: safeAreaHeight }}>
  //       <View className={s.toolbarInner} style={{ bottom: safeAreaHeight }}>
  //         <Button color={LINEAR_GRADIENT_PRIMARY} round block>
  //           支付
  //         </Button>
  //       </View>
  //     </View>
  //   </View>
  // );
  return <></>;
};
