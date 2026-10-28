import { motion } from 'motion/react';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'


export const ProductCardLoading = () => {

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-400/80 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer relative"
        >
            {/* Top Badges */}
            <div className="p-3 pb-0 flex items-center justify-between gap-2 z-10">
                <Skeleton width={50} height={30} />

                <Skeleton width={50} height={30} />
            </div>


            <div className="p-4 flex gap-4 items-start">
                <div className="w-24 h-24 rounded-xl bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 relative flex items-center justify-center shadow-inner">

                    <Skeleton width={"100%"} height={"100%"} />

  
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Skeleton width={150} height={15} />
                    </div>

                    <Skeleton width={150} height={15} />

                    <Skeleton width={150} height={15} />

                </div>
            </div>

            {/* Technical Specs Pills */}
            <div className="px-4 py-2 bg-slate-50/80 group-hover:bg-sky-50/30 border-y border-slate-100 transition-colors flex flex-wrap gap-1.5 text-xs text-slate-700">
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
                <Skeleton width={50} height={30} />
            </div>



         
        </motion.div>
    );
};

