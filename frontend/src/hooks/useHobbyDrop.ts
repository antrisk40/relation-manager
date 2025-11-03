import { useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const useHobbyDrop = (userId: string) => {
  const { addHobbyToUser } = useStore();
  
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'hobby',
    drop: async (item: { hobby: string }) => {
      try {
        await addHobbyToUser(userId, item.hobby);
        toast.success(`Hobby "${item.hobby}" added to user`);
      } catch (error) {
        console.error('Error adding hobby:', error);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return { drop, isOver };
};

